import { parseApiError } from './src/utils/apiError.js';

console.log('Test 1:', parseApiError(new Error('{"message":"Invalid credentials","error":"Unauthorized","statusCode":401}')));
console.log('Test 2:', parseApiError(new Error('Error: {"message":"Invalid credentials","error":"Unauthorized","statusCode":401}')));
console.log('Test 3:', parseApiError('{"message":"Invalid credentials"}'));
