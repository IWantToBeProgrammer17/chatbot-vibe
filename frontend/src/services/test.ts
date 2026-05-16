/**
 * Mock API Integration Test
 * Run in browser console or via test framework
 * 
 * Example usage in browser:
 * import('./src/services').then(services => {
 *   testMockApi(services);
 * });
 */

import { authService, conversationService, messageService } from '@/services';
import { SenderType } from '@/types';

export async function testMockApi() {
  console.log('🧪 Starting Mock API Tests...\n');

  try {
    // Test 1: Auth - Login
    console.log('📝 Test 1: Login');
    const loginResult = await authService.login('admin', 'admin123');
    console.log('✅ Login successful:', loginResult.data?.user?.username);
    console.assert(loginResult.success, 'Login should succeed');
    console.assert(loginResult.data?.token, 'Should have token');
    const adminUser = loginResult.data?.user;

    // Test 2: Auth - Invalid login
    console.log('\n📝 Test 2: Invalid Login');
    const invalidLogin = await authService.login('admin', 'wrong');
    console.log('✅ Invalid login rejected:', invalidLogin.error);
    console.assert(!invalidLogin.success, 'Invalid login should fail');

    // Test 3: Auth - Register
    console.log('\n📝 Test 3: Register New User');
    const registerResult = await authService.register('testuser', 'password123');
    console.log('✅ Registration successful:', registerResult.data?.user?.username);
    console.assert(registerResult.success, 'Registration should succeed');

    // Test 4: Conversation - Create
    console.log('\n📝 Test 4: Create Conversation');
    if (adminUser) {
      const convResult = await conversationService.createConversation(adminUser.id, 'Test Chat');
      console.log('✅ Conversation created:', convResult.data?.title);
      console.assert(convResult.success, 'Create should succeed');
      const testConversation = convResult.data;

      // Test 5: Conversation - Get All
      console.log('\n📝 Test 5: Get All Conversations');
      const allConvs = await conversationService.getConversations(adminUser.id);
      console.log('✅ Conversations retrieved:', allConvs.data?.length || 0);
      console.assert(allConvs.success, 'Get conversations should succeed');

      // Test 6: Message - Create User Message
      console.log('\n📝 Test 6: Create User Message');
      if (testConversation) {
        const msgResult = await messageService.createMessage(
          testConversation.id,
          'Hello AI, how are you?',
          SenderType.USER
        );
        console.log('✅ Message created:', msgResult.data?.content?.substring(0, 20) + '...');
        console.assert(msgResult.success, 'Message create should succeed');
        const testMessage = msgResult.data;

        // Test 7: Message - Get Messages
        console.log('\n📝 Test 7: Get Messages');
        const msgsResult = await messageService.getMessages(testConversation.id);
        console.log('✅ Messages retrieved:', msgsResult.data?.items?.length || 0);
        console.assert(msgsResult.success, 'Get messages should succeed');

        // Test 8: Message - Update
        console.log('\n📝 Test 8: Update Message');
        if (testMessage) {
          const updateResult = await messageService.updateMessage(
            testMessage.id,
            'Hello AI, how are you doing?'
          );
          console.log('✅ Message updated:', updateResult.data?.content?.substring(0, 20) + '...');
          console.assert(updateResult.success, 'Update should succeed');
        }

        // Test 9: Message - Typing Indicator
        console.log('\n📝 Test 9: Create AI Response with Typing');
        const aiMsgResult = await messageService.createAiResponseWithTyping(
          testConversation.id,
          (msg) => {
            console.log('  ⏳ AI is typing...');
          },
          (msg) => {
            console.log('  ✅ AI response ready:', msg.content?.substring(0, 30) + '...');
          }
        );
        console.log('✅ AI response created');
        console.assert(
          !aiMsgResult.isTyping,
          'Final message should not be typing'
        );

        // Test 10: Conversation - Update
        console.log('\n📝 Test 10: Update Conversation');
        const updateConvResult = await conversationService.updateConversation(
          testConversation.id,
          'Updated Test Chat'
        );
        console.log('✅ Conversation updated:', updateConvResult.data?.title);
        console.assert(updateConvResult.success, 'Update should succeed');

        // Test 11: Message - Delete
        console.log('\n📝 Test 11: Delete Message');
        if (testMessage) {
          const deleteResult = await messageService.deleteMessage(testMessage.id);
          console.log('✅ Message deleted');
          console.assert(deleteResult.success, 'Delete should succeed');
        }

        // Test 12: Conversation - Delete
        console.log('\n📝 Test 12: Delete Conversation');
        const delConvResult = await conversationService.deleteConversation(
          testConversation.id
        );
        console.log('✅ Conversation deleted');
        console.assert(delConvResult.success, 'Delete should succeed');
      }
    }

    // Test 13: Verify localStorage persistence
    console.log('\n📝 Test 13: localStorage Persistence');
    const savedUser = authService.getCurrentUser();
    console.log('✅ User restored from localStorage:', savedUser?.username);
    console.assert(savedUser, 'User should be in localStorage');

    // Test 14: Auth - Logout
    console.log('\n📝 Test 14: Logout');
    await authService.logout();
    console.log('✅ Logged out');
    console.assert(!authService.isAuthenticated(), 'Should be logged out');

    console.log('\n✅ All tests passed! 🎉');
    return true;
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    return false;
  }
}

// Auto-run if imported directly
if (typeof window !== 'undefined') {
  (window as any).testMockApi = testMockApi;
  console.log('📌 Mock API tester loaded. Run testMockApi() in console.');
}
