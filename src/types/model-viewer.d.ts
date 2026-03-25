import type * as React from "react";

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "model-viewer": React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string;
        alt?: string;
        poster?: string;
        ar?: boolean | "true" | "false";
        "camera-controls"?: boolean | "true" | "false";
        "auto-rotate"?: boolean | "true" | "false";
        autoplay?: boolean | "true" | "false";
        shadowIntensity?: string | number;
        exposure?: string | number;
        environmentImage?: string;
        skyboxImage?: string;
        loading?: "auto" | "eager" | "lazy";
        reveal?: "auto" | "interaction" | "manual";
        "interaction-prompt"?: "auto" | "none";
        "camera-orbit"?: string;
        "min-camera-orbit"?: string;
        "max-camera-orbit"?: string;
        "field-of-view"?: string;
        "min-field-of-view"?: string;
        "max-field-of-view"?: string;
      };
    }
  }
}

export {};
