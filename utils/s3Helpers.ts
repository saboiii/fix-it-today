import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "@/lib/s3";
import { v4 as uuidv4 } from "uuid";

// Helper to upload a file buffer to S3
export async function uploadFileToS3(buffer: Buffer, filename: string, mimetype: string, folder: string) {
  const ext = filename.split(".").pop();
  const key = `${folder}/${uuidv4()}.${ext}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: mimetype,
    })
  );
  return `https://${process.env.NEXT_PUBLIC_S3_BUCKET_NAME}.s3.amazonaws.com/${key}`;
}

// Helper to delete a file from S3 by URL
export async function deleteFileFromS3(url: string) {
  try {
    const bucket = process.env.NEXT_PUBLIC_S3_BUCKET_NAME!;
    const key = url.split(`.amazonaws.com/`)[1];
    if (!key) return;
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucket,
        Key: key,
      })
    );
  } catch (err) {
    console.error("Failed to delete from S3:", err);
  }
}