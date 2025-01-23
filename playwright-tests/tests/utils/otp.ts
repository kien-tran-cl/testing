import fetch from 'node-fetch';
import { config } from 'dotenv';
config(); // Load .env file

// Type definition for a single message
export type ApiMessage = {
  id: string;
  status: string;
  type: string;
  recipient: string;
  body: string;
  subject: string;
  template_type: string;
  channel: string;
  send_count: number;
  created_at: string;
  updated_at: string;
};

// Type definition for the API response (an array of messages)
export type ApiResponse = ApiMessage[];

/**
 * Fetch OTP code from API
 * @param recipient The email address to fetch the OTP for
 * @returns OTP code as a string
 */
export async function fetchOtpCode(recipient: string): Promise<string> {
  const apiUrl = process.env.OTP_API_URL;
  const apiKey = process.env.OTP_API_KEY;

  if (!apiUrl || !apiKey) {
    throw new Error(
      'OTP API URL or Key is not defined in the environment variables.',
    );
  }

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    Accept: 'application/json',
  };

  try {
    // Send a GET request to the API
    const response = await fetch(
      `${apiUrl}?recipient=${encodeURIComponent(recipient)}`,
      {
        method: 'GET',
        headers,
      },
    );

    // Check if the request was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch OTP: ${response.statusText}`);
    }

    // Parse the response and assert its type
    const data = (await response.json()) as ApiResponse;

    // Ensure the response contains at least one message
    if (data.length === 0) {
      throw new Error('No messages found for the recipient.');
    }

    // Get the latest message
    const latestMessage = data[0];

    // Extract OTP from the subject using a regex
    const otpMatch = RegExp(/Login-Code (\d{6})/).exec(latestMessage.subject);
    if (!otpMatch) {
      throw new Error('Failed to extract OTP from the subject.');
    }

    // Return the extracted OTP
    return otpMatch[1];
  } catch (error) {
    console.error('Error fetching OTP:', error);
    throw error;
  }
}
