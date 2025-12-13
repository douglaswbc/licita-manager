// supabase/functions/create-client-user/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Recebe dados
    const { email, password, clientId } = await req.json()

    if (!email || !password || !clientId) throw new Error("Dados incompletos")

    // 2. Cria o usuário no Auth
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { role: 'client' } // Metadado importante
    })

    if (createError) throw createError

    // 3. Cria o Perfil como 'client'
    // (O trigger handle_new_user cria como 'user' por padrão, vamos atualizar para 'client')
    await supabaseAdmin
      .from('profiles')
      .update({ role: 'client', active: true })
      .eq('id', user.user.id)

    // 4. Vincula o Cliente da tabela 'clients' a este novo usuário
    const { error: updateError } = await supabaseAdmin
      .from('clients')
      .update({ auth_user_id: user.user.id })
      .eq('id', clientId)

    if (updateError) throw updateError

    return new Response(JSON.stringify({ success: true, userId: user.user.id }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400, headers: corsHeaders })
  }
})