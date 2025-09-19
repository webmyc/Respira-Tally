import { basehub } from "basehub";

export default async function testBaseHub() {
  try {
    const data = await basehub().query({
      _sys: {
        playgroundInfo: {
          expiresAt: true,
          editUrl: true,
          claimUrl: true,
        },
      },
    });
    console.log("BaseHub connection successful:", data);
    return data;
  } catch (error) {
    console.error("BaseHub error:", error);
    throw error;
  }
}
