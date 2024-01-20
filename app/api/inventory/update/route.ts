import { Notify, updateInventory } from "@/lib/flex-actions";
import prismadb from "@/lib/prismadb";
import { auth } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export const runtime = 'edge'; // 'nodejs' is the default

export async function GET(
  req: Request
) {
  try {
    let user: string;

    if (req.headers.get('Authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
      const { userId } = auth();
  
      if (!userId) {
        return new NextResponse("Unauthorized", { status: 401 });
      }

      user = userId

    } else {
      user = "SYSTEM_ADMIN"
    }

    let responseStream = new TransformStream();
    const writer = responseStream.writable.getWriter();
    const encoder = new TextEncoder();
    let closed = false;

    const notify: Notify = {
      log: (msg: string) => {
        writer.write(encoder.encode("data: " + msg + "\n\n"));
      },
      json: (obj: any) => writer.write(encoder.encode("data: " + JSON.stringify(obj) + "\n\n")),
      error: (err: Error | any) => {
        writer.write(encoder.encode("data: " + err?.message + "\n\n"));
        if (!closed) {
          writer.close();
          closed = true;
        }
      },
      close: () => {
        if (!closed) {
          writer.close();
          closed = true;
        }
      },
    }
    
    updateInventory(notify).then(async () => {

      notify.log("Inventory Update Complete")

      if(!closed){
        writer.close();
      }
    });

    return new Response(responseStream.readable, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "text/event-stream; charset=utf-8",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
        "X-Accel-Buffering": "no",
        "Content-Encoding": "none",
      },
    });
  } catch (error) {
    console.log(`[UPDATE_GET]`, error);
    return new NextResponse("Internal error", { status: 500 });
  }
}