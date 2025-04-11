// Primary tokens
export const PRIMARY_TOKENS = {
  ADMIN: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJhZG1pbkBkZW1vLmNvbSIsImlhdCI6MTc0NDM4MjQxNSwiZXhwIjoxNzQ0MzkwODE1fQ.2lJ0KmlMv8k3rQ_234CtFu5d7afYRXVowJXmHoLEwDzWa-jEfIDjGEy7FvCiV1yW11AXeKmHV1qJoK6pMFSQzg',
  USER: 'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ1c2VyQGRlbW8uY29tIiwiaWF0IjoxNzQ0MzgyNTgyLCJleHAiOjE3NDQzOTA5ODJ9.Y_gYAZ_TA5yidBa5Wt7DH8DV8lBvMK4Y_SutvqysH2zV_1jecYWFjKWxt88LZ-ud6eMwwrt9zu-c9pAtTpRRqg'
};

// Helper function to attempt API call with different tokens
export const attemptWithTokens = async (apiCall, isAdminRequired = false) => {
  const primaryToken = isAdminRequired ? PRIMARY_TOKENS.ADMIN : PRIMARY_TOKENS.USER;
  
  try {
    // First attempt with primary token
    console.log(`Attempting with primary ${isAdminRequired ? 'admin' : 'user'} token...`);
    const result = await apiCall(primaryToken);
    return result;
  } catch (primaryError) {
    console.log('Primary token failed, attempting with automatic token...');
    
    // Second attempt with automatic token
    const automaticToken = localStorage.getItem('token');
    if (!automaticToken) {
      throw new Error('No automatic token available and primary token failed');
    }

    try {
      const result = await apiCall(automaticToken);
      return result;
    } catch (automaticError) {
      console.error('Both token attempts failed:', {
        primaryError,
        automaticError
      });
      throw automaticError;
    }
  }
}; 