import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from "uuid";

const s3Client = new S3Client();
const bucketName = process.env.BUCKET_NAME;

export const handler = async (event) => {
    try {
        console.log("Received event:", JSON.stringify(event, null, 2));

      
        const uuidList = Array.from({ length: 10 }, () => uuidv4());

    
        const data = {
            ids: uuidList
        };

        const timestamp = new Date().toISOString();

        const fileName = timestamp;

        const params = {
            Bucket: bucketName,
            Key: fileName,
            Body: JSON.stringify(data),
            ContentType: 'application/json'
        };

        console.log("Saving to S3:", JSON.stringify(params, null, 2));
        const response = await s3Client.send(new PutObjectCommand(params));
        console.log("File saved to S3 successfully:", response);

        const responseBody = {
            statusCode: 200,
            body: JSON.stringify('UUIDs generated and saved to S3 successfully.'),
        };

        console.log("Final response:", JSON.stringify(responseBody, null, 2));
        return responseBody;

    } catch (error) {
        console.error("Error processing request:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error", error: error.message }),
        };
    }
};
