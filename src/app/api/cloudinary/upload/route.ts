import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { cloudinaryService, stageBookingCloudinaryService } from "@/lib/cloudinary";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const folder = formData.get('folder') as string || 'stage-designs';
    const config = formData.get('config') as string || 'primary';
    const tags = formData.get('tags') as string || 'stage-booking,design';

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const uploadedFiles = [];
    
    // Determine the actual config to use (fallback to primary if secondary is not available)
    const availableConfigs = cloudinaryService.getAvailableConfigs();
    const actualConfig = (config === 'secondary' && !availableConfigs.includes('secondary')) ? 'primary' : config;

    for (const file of files) {
      try {
        const service = actualConfig === 'secondary' ? stageBookingCloudinaryService : cloudinaryService;
        
        const result = await service.uploadFileWithConfig(file, actualConfig, {
          folder,
          resource_type: 'auto',
          tags: tags.split(',').map(tag => tag.trim()),
        });

        uploadedFiles.push({
          filename: file.name,
          originalName: file.name,
          url: result.secure_url,
          publicId: result.public_id,
          mimeType: file.type,
          size: file.size,
          config: actualConfig,
        });
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error);
        return NextResponse.json(
          { error: `Failed to upload file: ${file.name}` },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
      config: actualConfig,
    });

  } catch (error) {
    console.error("File upload error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}