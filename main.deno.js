import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as dotenv from "https://deno.land/std@0.167.0/dotenv/mod.ts";
import { serve } from "https://deno.land/std@0.151.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.151.0/http/file_server.ts";

await dotenv.config({
  export: true,

  safe: true,
  example: ".env.example",
  path: ".env"
});

const config = Deno.env.toObject();
console.log(config["SUPABASEURL"], config["SUPABASEKEY"]);

const supabase = createClient(
  config["SUPABASEURL"],
  config["SUPABASEKEY"],
  {
    auth: {
      persistSession: false
    }
  }
);

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  console.log(url);

  if (pathname === "/hc" && req.method === "GET") {
    return new Response("server active");
  }

  if (pathname === "/message") {
    if (req.method === "GET") {
      const time = url.searchParams.get("time");
      const res = await supabase.from("messages").select();
      return new Response(JSON.stringify(res));
    } else if (req.method === "POST") {
      return new Response("now implementing", {status: 500})
    }
  }

  return serveDir(req, {
    fsRoot: "public",
    urlRoot: "",
    showDirListing: true,
    enableCors: true,
  });
});