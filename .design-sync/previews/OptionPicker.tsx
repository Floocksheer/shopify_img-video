import { useState } from "react";
import { OptionPicker } from "lumora";

export function BackgroundThemes() {
  const [value, setValue] = useState("marble");
  return (
    <div className="w-full max-w-md">
      <OptionPicker
        label="Background theme"
        columns={2}
        value={value}
        onChange={setValue}
        options={[
          { id: "marble", label: "Marble", hint: "Cool white stone" },
          { id: "linen", label: "Linen", hint: "Soft natural fabric" },
          { id: "terracotta", label: "Terracotta", hint: "Warm clay tones" },
          { id: "studio", label: "Studio", hint: "Seamless gray sweep" },
        ]}
      />
    </div>
  );
}

export function AspectRatio() {
  const [value, setValue] = useState("4:5");
  return (
    <div className="w-full max-w-sm">
      <OptionPicker
        label="Aspect ratio"
        columns={3}
        value={value}
        onChange={setValue}
        options={[
          { id: "1:1", label: "1:1" },
          { id: "4:5", label: "4:5" },
          { id: "9:16", label: "9:16" },
        ]}
      />
    </div>
  );
}
