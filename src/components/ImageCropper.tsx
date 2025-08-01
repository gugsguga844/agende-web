import React, { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { X, RotateCw, Check, Upload, Save } from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  onCropComplete: (croppedImage: File) => void;
  imageFile: File | null;
}

const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  onCropComplete,
  imageFile
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [imageSrc, setImageSrc] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Função para centralizar o crop
  const centerAspectCrop = useCallback(
    (mediaWidth: number, mediaHeight: number, aspect: number) => {
      return centerCrop(
        makeAspectCrop(
          {
            unit: '%',
            width: 90,
          },
          aspect,
          mediaWidth,
          mediaHeight,
        ),
        mediaWidth,
        mediaHeight,
      );
    },
    [],
  );

  // Função para carregar a imagem quando o modal abrir
  React.useEffect(() => {
    if (isOpen && imageFile) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(imageFile);
    }
  }, [isOpen, imageFile]);

  // Função para quando a imagem carregar
  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    const crop = centerAspectCrop(width, height, 1); // Aspect ratio 1:1 para foto de perfil
    setCrop(crop);
  }, [centerAspectCrop]);

  // Função para gerar a imagem cortada
  const generateCroppedImage = useCallback(async () => {
    if (!completedCrop || !imgRef.current || !canvasRef.current) return;

    const image = imgRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    if (!ctx) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height,
    );

    // Converter canvas para blob
    canvas.toBlob((blob) => {
      if (blob) {
        const croppedFile = new File([blob], imageFile?.name || 'cropped-image.jpg', {
          type: 'image/jpeg',
        });
        onCropComplete(croppedFile);
        onClose();
      }
    }, 'image/jpeg', 0.9);
  }, [completedCrop, imageFile, onCropComplete, onClose]);

  if (!isOpen) return null;



  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 !m-0">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold" style={{ color: '#343A40' }}>
            Ajustar Foto de Perfil
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={20} style={{ color: '#6C757D' }} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="mb-4">
            <p className="text-sm" style={{ color: '#6C757D' }}>
              Arraste para ajustar a área da foto. A imagem será cortada em formato quadrado.
            </p>
            <p className="text-xs mt-2" style={{ color: '#6C757D' }}>
              Clique em "Salvar Imagem" para aplicar as alterações.
            </p>
          </div>

          {/* Image Cropper */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              {imageSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(_, percentCrop) => setCrop(percentCrop)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  minWidth={100}
                  minHeight={100}
                >
                  <img
                    ref={imgRef}
                    alt="Crop me"
                    src={imageSrc}
                    onLoad={onImageLoad}
                    className="max-h-[300px] max-w-full"
                  />
                </ReactCrop>
              )}
            </div>
          </div>

          {/* Hidden canvas for processing */}
          <canvas ref={canvasRef} style={{ display: 'none' }} />
        </div>

        {/* Actions - Fixed at bottom */}
        <div className="flex justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg transition-colors border"
            style={{ color: '#6C757D', border: '1px solid #DEE2E6', backgroundColor: '#FFFFFF' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#F8F9FA';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#FFFFFF';
            }}
          >
            Cancelar
          </button>
          <button
            onClick={generateCroppedImage}
            disabled={isLoading || !completedCrop}
            className="flex items-center space-x-2 px-6 py-2 rounded-lg text-white transition-colors font-medium"
            style={{ 
              backgroundColor: (!completedCrop || isLoading) ? '#6C757D' : '#347474',
              minWidth: '140px'
            }}
            onMouseEnter={(e) => {
              if (completedCrop && !isLoading) {
                e.currentTarget.style.backgroundColor = '#2d6363';
              }
            }}
            onMouseLeave={(e) => {
              if (completedCrop && !isLoading) {
                e.currentTarget.style.backgroundColor = '#347474';
              }
            }}
          >
            <Save size={16} />
            <span>{isLoading ? 'Processando...' : 'Salvar Imagem'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper; 