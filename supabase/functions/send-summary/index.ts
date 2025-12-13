import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import nodemailer from "npm:nodemailer@6.9.7"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Tratamento de CORS
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Configuração do Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 2. Recebe APENAS o ID (o link nós buscamos no banco)
    const { bidId } = await req.json()

    // CORREÇÃO DO ERRO 400: Não exigimos mais summaryLink aqui
    if (!bidId) throw new Error("ID da licitação faltando.")

    // 3. Busca dados completos (Incluindo a coluna 'attachments')
    const { data: bid, error } = await supabase
      .from('licitacoes')
      .select(`
        id, titulo, link_docs, attachments,
        clients ( nome, email ),
        profiles (
          settings ( 
            assunto_resumo, msg_resumo, email_remetente, 
            smtp_host, smtp_port, smtp_user, smtp_pass 
          )
        )
      `)
      .eq('id', bidId)
      .single()

    if (error || !bid) throw new Error("Licitação não encontrada.")

    // @ts-ignore
    const cliente = bid.clients
    // @ts-ignore
    const config = bid.profiles?.settings?.[0]

    // 4. Validações de Segurança
    if (!cliente?.email) throw new Error("Cliente sem e-mail cadastrado.")
    if (!config || !config.smtp_user || !config.smtp_pass) throw new Error("Configure seu SMTP em Configurações.")

    // 5. Configura o Transporter (Nodemailer)
    const transporter = nodemailer.createTransport({
      host: config.smtp_host,
      port: config.smtp_port,
      secure: false, // Geralmente false para porta 587 (STARTTLS)
      auth: { user: config.smtp_user, pass: config.smtp_pass },
    });

    // 6. Prepara o Bloco HTML dos Documentos (Lógica Nova)
    let linksHtml = "";
    
    // Verifica se tem múltiplos anexos (attachments)
    // @ts-ignore
    if (bid.attachments && Array.isArray(bid.attachments) && bid.attachments.length > 0) {
       linksHtml = `
         <div style="margin: 25px 0; background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0;">
           <p style="margin: 0 0 15px 0; font-weight: bold; color: #002A54; font-size: 14px; text-transform: uppercase;">📂 Documentos para Análise:</p>
           <ul style="padding-left: 0; list-style: none; margin: 0;">
             ${bid.attachments.map((file: any) => `
               <li style="margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid #eee;">
                 <a href="${file.url}" target="_blank" style="color: #009B4D; text-decoration: none; font-weight: bold; display: flex; align-items: center;">
                    📥 Baixar: <span style="color: #334155; margin-left: 5px; font-weight: normal;">${file.name}</span>
                 </a>
               </li>
             `).join('')}
           </ul>
         </div>
       `;
    } 
    // Fallback: Se não tiver anexo novo, usa o link antigo se existir
    else if (bid.link_docs) {
       linksHtml = `
        <div style="margin: 30px 0; text-align: center;">
          <a href="${bid.link_docs}" target="_blank" style="background-color: #009B4D; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
            📄 Acessar Documentos da Licitação
          </a>
        </div>`;
    } else {
       // Caso extremo: sem link e sem arquivo
       linksHtml = `<p style="color: #ef4444; font-style: italic; text-align: center;">(Nenhum documento anexado digitalmente.)</p>`;
    }

    // 7. Monta o Corpo do E-mail
    const nomeAssessor = config.email_remetente || "Sua Assessoria";
    
    // Substituição de Variáveis
    let msgPersonalizada = config.msg_resumo || "Olá {{CLIENTE}}, identificamos uma oportunidade de licitação para sua empresa:\n\n{{LICITACAO}}";
    
    msgPersonalizada = msgPersonalizada
      .replace(/{{CLIENTE}}/g, cliente.nome)
      .replace(/{{LICITACAO}}/g, bid.titulo)
      .replace(/{{TITULO}}/g, bid.titulo)
      .replace(/{{ASSESSOR}}/g, nomeAssessor)
      .replace(/{{LINK}}/g, ""); // Remove a tag {{LINK}} antiga do texto

    // Template Final do E-mail
    const emailContent = `
      <div style="font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
        
        <div style="padding-bottom: 20px; border-bottom: 2px solid #009B4D; margin-bottom: 20px;">
           <h2 style="color: #002A54; margin: 0;">Nova Oportunidade</h2>
        </div>

        <div style="padding: 10px 0;">
          <p style="font-size: 16px; white-space: pre-wrap;">${msgPersonalizada}</p>
        </div>
        
        ${linksHtml}
        
        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; font-size: 12px; color: #64748b; text-align: center;">
          <p>Enviado via <strong>LicitaManager</strong> por: <br/>
          <strong style="font-size: 14px; color: #002A54;">${nomeAssessor}</strong></p>
        </div>
      </div>
    `;

    // 8. Envia o E-mail
    await transporter.sendMail({
      from: `"${nomeAssessor}" <${config.smtp_user}>`,
      to: cliente.email,
      subject: config.assunto_resumo || `Resumo: ${bid.titulo}`,
      html: emailContent
    });

    // 9. Atualiza o Banco (Marca que foi enviado)
    await supabase.from('licitacoes').update({ 
      resumo_enviado_em: new Date().toISOString()
    }).eq('id', bidId)

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err: any) {
    console.error("Erro no envio:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders })
  }
})