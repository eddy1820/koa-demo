import axios from 'axios';
import { env } from './src/config/env';

const API_BASE_URL = `http://localhost:${env.PORT}/api`;
const TOTAL_ACCOUNTS = 50;

interface UserData {
  username: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  accountId: number;
}

// Helper function to generate random user data
function generateUserData(index: number, accountId: number): UserData {
  const genders: Array<'male' | 'female' | 'other'> = ['male', 'female', 'other'];
  const randomGender = genders[Math.floor(Math.random() * genders.length)];
  const randomAge = Math.floor(Math.random() * (65 - 18 + 1)) + 18; // Age between 18-65

  return {
    username: `user_${index.toString().padStart(3, '0')}`,
    age: randomAge,
    gender: randomGender,
    accountId,
  };
}

async function loginAccount(email: string, password: string) {
  try {
    const response = await axios.post(`${API_BASE_URL}/auth/login`, {
      email,
      password,
    });

    return {
      accountId: response.data.data.user.id,
      token: response.data.data.token,
    };
  } catch (error: any) {
    console.error(`✗ Failed to login ${email}:`, error.response?.data?.message || error.message);
    return null;
  }
}

async function createUser(
  index: number,
  userData: UserData,
  token: string
) {
  try {
    await axios.post(
      `${API_BASE_URL}/users`,
      userData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log(`✓ [${index}/50] Created user: ${userData.username} (age: ${userData.age}, gender: ${userData.gender})`);
    return true;
  } catch (error: any) {
    if (error.response) {
      console.error(`✗ [${index}/50] Failed to create user ${userData.username}:`, error.response.data.message);
    } else {
      console.error(`✗ [${index}/50] Error creating user ${userData.username}:`, error.message);
    }
    return false;
  }
}

async function createUsersForAccounts() {
  console.log(`\n👥 Creating user profiles for existing accounts...\n`);
  console.log(`📍 API Base URL: ${API_BASE_URL}\n`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 1; i <= TOTAL_ACCOUNTS; i++) {
    const email = `user${i.toString().padStart(3, '0')}@example.com`;
    const password = `Password${i}`;

    // Login to get account ID and token
    const loginResult = await loginAccount(email, password);

    if (loginResult) {
      // Create user profile
      const userData = generateUserData(i, loginResult.accountId);
      const userCreated = await createUser(i, userData, loginResult.token);

      if (userCreated) {
        successCount++;
      } else {
        failCount++;
      }
    } else {
      failCount++;
    }

    // Add a small delay to avoid overwhelming the server
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\n✅ User creation completed!`);
  console.log(`   Success: ${successCount}/${TOTAL_ACCOUNTS}`);
  console.log(`   Failed: ${failCount}/${TOTAL_ACCOUNTS}\n`);
}

// Check if server is running before creating users
async function checkServer() {
  try {
    await axios.get(`http://localhost:${env.PORT}`);
    return true;
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkServer();

  if (!serverRunning) {
    console.error(`\n❌ Server is not running on port ${env.PORT}`);
    console.error(`   Please start the server first with: npm run dev\n`);
    process.exit(1);
  }

  await createUsersForAccounts();
}

main();
