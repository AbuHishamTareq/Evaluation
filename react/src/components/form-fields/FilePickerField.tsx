import React, { useEffect, useRef, useState } from "react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Upload, X, Image } from "lucide-react";

interface FilePickerFieldProps {
  id: string;
  name: string;
  label: string | React.ReactNode;
  value?: File | string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFileChange?: (file: File | null) => void;
  readOnly?: boolean;
  errors?: string[];
  accept?: string;
  maxSize?: number; // in MB
  placeholder?: string;
  showPreview?: boolean;
}

export function FilePickerField({
  id,
  name,
  label,
  value,
  onChange,
  onFileChange,
  readOnly = false,
  errors = [],
  accept = "image/*",
  maxSize = 5,
  placeholder = "Choose an image file...",
  showPreview = true,
}: FilePickerFieldProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (value instanceof File) {
      const url = URL.createObjectURL(value);
      setSelectedFile(value);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof value === "string") {
      setPreviewUrl(value);
      setSelectedFile(null);
    } else {
      setPreviewUrl(null);
      setSelectedFile(null);
    }
  }, [value]);

  const handleClick = () => {
    if (!readOnly) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > maxSize * 1024 * 1024) {
      alert(`File must be smaller than ${maxSize}MB`);
      return;
    }

    if (!file.type.match(accept.replace("*", ".*"))) {
      alert(`Invalid file type. Only ${accept} allowed.`);
      return;
    }

    setSelectedFile(file);
    onFileChange?.(file);

    if (showPreview && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setPreviewUrl(reader.result);
          // Simulate input change for base64 image
          const fakeEvent = {
            target: { name, value: reader.result },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(fakeEvent);
        }
      };
      reader.readAsDataURL(file);
    } else {
      onChange(e);
    }
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreviewUrl(null);
    setSelectedFile(null);
    fileInputRef.current!.value = "";

    const fakeEvent = {
      target: { name, value: "", files: null },
    } as React.ChangeEvent<HTMLInputElement>;

    onChange(fakeEvent);
    onFileChange?.(null);
  };

  const hasError = errors.length > 0;

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>

      {/* Hidden input */}
      <Input
        ref={fileInputRef}
        id={id}
        name={name}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        disabled={readOnly}
      />

      {/* Upload Box */}
      <div
        className={`
          relative p-6 border-2 border-dashed rounded-lg text-center cursor-pointer transition-colors
          ${readOnly ? "cursor-not-allowed opacity-50" : "hover:bg-gray-100"}
          ${hasError ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"}
        `}
        onClick={handleClick}
      >
        {previewUrl ? (
          <div className="space-y-3">
            {showPreview && (
              <div className="relative inline-block">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-32 max-h-32 object-cover border rounded-lg"
                />
                {!readOnly && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6 p-0"
                    onClick={handleRemove}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
            <div className="text-sm">
              <p className="font-medium text-gray-900">
                {selectedFile?.name || "Uploaded File"}
              </p>
              {selectedFile && (
                <p className="text-gray-500">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="mx-auto h-12 w-12 text-gray-400">
              {accept.includes("image") ? (
                <Image className="w-full h-full" />
              ) : (
                <Upload className="w-full h-full" />
              )}
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{placeholder}</p>
              <p className="text-gray-500">
                {accept} | Max: {maxSize}MB
              </p>
            </div>
          </div>
        )}
      </div>

      {!readOnly && previewUrl && (
        <Button variant="outline" size="sm" onClick={handleClick} className="w-full mt-2">
          <Upload className="h-4 w-4 mr-2" />
          Change File
        </Button>
      )}

      {hasError && (
        <div className="text-sm text-red-600 space-y-1">
          {errors.map((msg, i) => (
            <p key={i}>{msg}</p>
          ))}
        </div>
      )}
    </div>
  );
}
