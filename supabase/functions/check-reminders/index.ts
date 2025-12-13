import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import nodemailer from "npm:nodemailer@6.9.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    // Ajuste aqui se sua URL de produção for diferente
    const FRONTEND_URL = 'https://www.licitamanager.com.br/login'; 

    const supabase = createClient(supabaseUrl, supabaseKey)

    // --- LÓGICA DE DIAS ÚTEIS ---
    const hoje = new Date();
    let dataAlvo = new Date(hoje);
    let diasUteisAdicionados = 0;
    const diasUteisParaAdicionar = 2; // Queremos avisar 2 dias úteis antes

    while (diasUteisAdicionados < diasUteisParaAdicionar) {
        // Avança 1 dia no calendário
        dataAlvo.setDate(dataAlvo.getDate() + 1);
        const diaSemana = dataAlvo.getDay();

        // 0 = Domingo, 6 = Sábado
        // Se NÃO for fim de semana, incrementa o contador
        if (diaSemana !== 0 && diaSemana !== 6) {
            diasUteisAdicionados++;
        }
    }

    const dataAlvoString = dataAlvo.toISOString().split('T')[0];
    // -----------------------------

    console.log(`📅 Hoje: ${hoje.toISOString().split('T')[0]}`);
    console.log(`🚀 Buscando licitações para data alvo (2 dias úteis): ${dataAlvoString}`);

    // 1. Busca licitações E as configurações de SMTP do dono (join)
    const { data: licitacoes, error } = await supabase
      .from('licitacoes')
      .select(`
        id, titulo, data_licitacao, link_docs, user_id,
        clients ( nome, email, access_token ),
        profiles (
          settings ( 
            assunto_lembrete, msg_lembrete, email_remetente,
            smtp_host, smtp_port, smtp_user, smtp_pass 
          )
        )
      `)
      .eq('data_licitacao', dataAlvoString)
      .eq('lembrete_enviado', false)

    if (error) throw error
    
    const resultados = []

    if (licitacoes && licitacoes.length > 0) {
      for (const item of licitacoes) {
        // @ts-ignore
        const cliente = item.clients
        // @ts-ignore
        const config = item.profiles?.settings?.[0]

        // Só envia se tiver cliente E configurações de SMTP preenchidas
        if (cliente?.email && config && config.smtp_user && config.smtp_pass) {
          
          // CRIA O TRANSPORTE DINÂMICO COM OS DADOS DO USUÁRIO
          const transporter = nodemailer.createTransport({
            host: config.smtp_host || 'smtp.gmail.com',
            port: config.smtp_port || 587,
            secure: false, // true para 465, false para outras
            auth: {
              user: config.smtp_user,
              pass: config.smtp_pass,
            },
          });

          let mensagem = config.msg_lembrete
            .replace('{{CLIENTE}}', cliente.nome)
            .replace('{{LICITACAO}}', item.titulo);

          const linkPortal = `${FRONTEND_URL}/portal/${cliente.access_token}?id=${item.id}`;

          const htmlEmail = `
            <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px;">
              <p style="font-size: 16px;">${mensagem}</p>
              <div style="margin: 30px 0;">
                <a href="${linkPortal}" style="background-color: #2563EB; color: white; padding: 14px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                  DECIDIR AGORA
                </a>
              </div>
              <p style="font-size: 12px; color: #888; margin-top: 20px;">
                Este é um lembrete automático do sistema LicitaManager.
              </p>
            </div>
          `;

          try {
            await transporter.sendMail({
              from: `"Licita Manager" <${config.smtp_user}>`, 
              to: cliente.email,
              subject: config.assunto_lembrete || `Atenção: Licitação ${item.titulo}`,
              html: htmlEmail
            });

            await supabase.from('licitacoes').update({ 
              lembrete_enviado: true, 
              lembrete_enviado_em: new Date().toISOString(),
              status: 'Aguardando Cliente'
            }).eq('id', item.id)
            
            resultados.push({ id: item.id, status: 'Enviado por', by: config.smtp_user })
          } catch (emailError: any) {
            console.error(`Erro envio usuário ${config.smtp_user}:`, emailError)
            resultados.push({ id: item.id, status: 'Erro SMTP', error: emailError.message })
          }
        } else {
          console.log(`Pular ID ${item.id}: Falta SMTP configurado pelo usuário.`)
        }
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      buscando_por_data: dataAlvoString, // <--- ADICIONADO PARA SABERMOS A DATA
      encontrados: licitacoes?.length || 0,
      log: resultados 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders })
  }
})