import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as dotenv from 'https://deno.land/std@0.167.0/dotenv/mod.ts';
import { serve } from 'https://deno.land/std@0.151.0/http/server.ts';
import { serveDir } from 'https://deno.land/std@0.151.0/http/file_server.ts';

await dotenv.config({
  export: true,

  safe: true,
  example: '.env.example',
  path: '.env'
});

const config = Deno.env.toObject();
console.log(config['SUPABASEURL'], config['SUPABASEKEY']);

const supabase = createClient(
  config['SUPABASEURL'],
  config['SUPABASEKEY'],
  {
    auth: {
      persistSession: false
    }
  }
);

const decoder = new TextDecoder();

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  console.log(url);

  if (pathname === '/hc' && req.method === 'GET') {
    return new Response('server active');
  }

  if (pathname === '/message') {
    if (req.method === 'GET') {
      const time = url.searchParams.get('time');
      const res = await supabase
                              .from('messages')
                              .select('message, dots')
                              .limit(1)
                              .order('id', { ascending: false })
      if (res?.error !== null) return new Response('internal server error', {status: 500});
      return new Response(JSON.stringify({message: res.data[0].message, dots: JSON.stringify(res.data[0].dots)}));
    } else if (req.method === 'POST') {
      const reader = req.body?.getReader();
      /**
       * @type {Uint8Array}
       */
      let buf = '';
      while (true) {
        const tmp = await reader.read();
        buf += decoder.decode(tmp?.value);
        if (tmp.done) break;
      }
      const data = JSON.parse(buf);
      const res = await supabase
                              .from('messages')
                              .insert({
                                message: data.message,
                                dots: data.dots
                              })
                              .select();
      console.log(res);
      if (res?.error !== null) return new Response('internal server error', {status: 500});
      return new Response(JSON.stringify({id: res?.data[0].id}), {status: 201})
    }
  }

  return serveDir(req, {
    fsRoot: 'public',
    urlRoot: '',
    showDirListing: true,
    enableCors: true,
  });
});