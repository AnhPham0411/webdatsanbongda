"use client";

import { useState } from "react";
import { uploadImageLocal } from "@/actions/admin/upload"; // Import action vừa viết
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Loader2, ImagePlus } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

interface LocalImageUploadProps {
  value: string[];
  onChange: (value: string[]) => void;
  onRemove: (value: string) => void;
  disabled?: boolean;
}

export const LocalImageUpload = ({
  value,
  onChange,
  onRemove,
  disabled
}: LocalImageUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    const res = await uploadImageLocal(formData);

    if (res.error) {
      toast.error(res.error);
    } else if (res.success) {
      // res.success là đường dẫn ảnh: "/uploads/..."
      onChange([...value, res.success]); 
      toast.success("Upload thành công!");
    }
    
    setIsUploading(false);
    // Reset input value để cho phép chọn lại cùng 1 file nếu muốn
    e.target.value = "";
  };

  return (
    <div>
      {/* Danh sách ảnh đã upload */}
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[130px] rounded-md overflow-hidden border">
            <div className="z-10 absolute top-2 right-2">
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="icon" className="h-6 w-6">
                <X className="h-3 w-3" />
              </Button>
            </div>
            <Image fill className="object-cover" alt="Image" src={url} />
          </div>
        ))}
      </div>

      {/* Nút Upload */}
      <div className="flex items-center gap-4">
        <Button
            type="button"
            variant="secondary"
            disabled={disabled || isUploading}
            onClick={() => document.getElementById("fileInput")?.click()}
        >
            {isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
            Tải ảnh lên
        </Button>
        <Input 
            id="fileInput" 
            type="file" 
            accept="image/*" 
            className="hidden" 
            onChange={handleUpload} 
            disabled={disabled || isUploading}
        />
      </div>
    </div>
  );
};