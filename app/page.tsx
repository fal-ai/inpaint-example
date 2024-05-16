"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import * as fal from "@fal-ai/serverless-client";
import { CanvasPainter } from "@/components/canvas";
import { Input } from "@/components/ui/input";

const seed = Math.floor(Math.random() * 100000);

fal.config({
  proxyUrl: "/api/proxy",
});

const INITIAL_PROMPT = "a cat";

export default function Home() {
  const [prompt, setPrompt] = useState<string>(INITIAL_PROMPT);
  const [loading, setLoading] = useState(false);
  const canvasPainterRef = useRef<any>(null);
  const [output, setOutput] = useState<any>(null);

  async function generateImage() {
    setLoading(true);
    const maskUrl = canvasPainterRef.current.exportMaskAsDataURL();
    const result: any = await fal.subscribe("fal-ai/fooocus/inpaint", {
      input: {
        prompt: prompt + ", realistic, highly detailed, 8k",
        negative_prompt:
          "(worst quality, low quality, normal quality, lowres, low details, oversaturated, undersaturated, overexposed, underexposed, grayscale, bw, bad photo, bad photography, bad art:1.4), (watermark, signature, text font, username, error, logo, words, letters, digits, autograph, trademark, name:1.2), (blur, blurry, grainy), morbid, ugly, asymmetrical, mutated malformed, mutilated, poorly lit, bad shadow, draft, cropped, out of frame, cut off, censored, jpeg artifacts, out of focus, glitch, duplicate, (airbrushed, cartoon, anime, semi-realistic, cgi, render, blender, digital art, manga, amateur:1.3), (3D ,3D Game, 3D Game Scene, 3D Character:1.1), (bad hands, bad anatomy, bad body, bad face, bad teeth, bad arms, bad legs, deformities:1.3)",
        styles: ["Fooocus Sharp", "Fooocus Enhance", "Fooocus V2"],
        performance: "Extreme Speed",
        guidance_scale: 4,
        sharpness: 2,
        aspect_ratio: "512x512",
        num_images: 1,
        loras: [
          {
            path: "https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0/resolve/main/sd_xl_offset_example-lora_1.0.safetensors",
            scale: 0.1,
          },
        ],
        refiner_model: "None",
        refiner_switch: 0.8,
        output_format: "jpeg",
        seed: 176400,
        inpaint_image_url:
          "https://raw.githubusercontent.com/CompVis/latent-diffusion/main/data/inpainting_examples/overture-creations-5sI6fQgYIuo.png",
        mask_image_url: maskUrl,
        inpaint_mode: "Inpaint or Outpaint (default)",
        outpaint_selections: [],
        inpaint_engine: "v2.6",
        inpaint_strength: 1,
        inpaint_respective_field: 0.618,
        image_prompt_1: {
          type: "ImagePrompt",
          stop_at: 0.5,
          weight: 1,
        },
        image_prompt_2: {
          type: "ImagePrompt",
          stop_at: 0.5,
          weight: 1,
        },
        image_prompt_3: {
          type: "ImagePrompt",
          stop_at: 0.5,
          weight: 1,
        },
        image_prompt_4: {
          type: "ImagePrompt",
          stop_at: 0.5,
          weight: 1,
        },
        enable_safety_checker: true,
      },
      logs: true,
      pollInterval: 500,
    });
    console.log(result);
    if (result) {
      setOutput(result.images[0].url);
    }
    setLoading(false);
  }

  return (
    <main
      className="
    p-4 pt-0 md:p-12 md:pt-0 flex-col"
    >
      <div className="mt-20">
        <h1 className="text-4xl font-bold">FAL AI INPAINT EXAMPLE</h1>
        <div>
          <div className="flex flex-row space-x-2">
            <Button
              disabled={loading}
              type="submit"
              onClick={() => generateImage()}
            >
              {loading ? "Generating.." : "Generate"}
            </Button>
            <Input
              type="text"
              placeholder="Imagine.."
              className="text-sm lg:text-md flex rounded-lg lg:h-12 w-full bg-black/5 dark:bg-white/5"
              onKeyDown={(e) => {
                if (loading) return;
                if (e.key === "Enter") {
                  generateImage();
                }
              }}
              value={prompt ?? ""}
              onChange={(e: any) => {
                setPrompt(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="text-lg flex gap-10 mt-20">
          <div>
            <div className="absolute">
              <CanvasPainter ref={canvasPainterRef}></CanvasPainter>
            </div>
            <img src="https://raw.githubusercontent.com/CompVis/latent-diffusion/main/data/inpainting_examples/overture-creations-5sI6fQgYIuo.png" />
          </div>
          <div>
            <div className="h-[512px] w-[512px] bg-indigo-512 border-solid border-indigo-600 border-2">
              {output && <img src={output} />}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
