# Debugging Guide for "internal" Errors in `createTask`

If you encounter an "internal" error again when creating a task, follow these steps to diagnose the issue.

## 1. Check Cloud Functions Logs

The most crucial step is to check the logs for the `createTask` function in the Firebase console.

1.  Go to the **Firebase Console** for your project.
2.  Navigate to the **Functions** section.
3.  Click on the **Logs** tab.
4.  Filter the logs for the `createTask` function.
5.  Look for any error messages that occurred around the time you tried to create the task. The function is now set up to log detailed error messages, which will point to the exact cause (e.g., "Validation failed...", "Failed to create task in Firestore...").

## 2. Verify Client-Side Payload

The error could be due to the data sent from the browser.

1.  In your browser's developer tools (usually F12), go to the **Network** tab.
2.  Submit the "New Task" form.
3.  Find the network request to `createTask`.
4.  Examine the **Payload** or **Request** tab to see the exact JSON object that was sent to the function.
5.  Compare this object with the expected structure in the `createTask` function in `functions/src/index.ts`. Check for missing required fields, incorrect data types, or `null`/`undefined` values where they are not expected.

## 3. Review Firestore Security Rules

An "internal" error can sometimes mask a "permission-denied" error from Firestore if not caught correctly.

1.  Go to the **Firestore Database** section in your Firebase Console.
2.  Click on the **Rules** tab.
3.  Ensure the rules for `match /tasks/{tid}` are correctly configured to allow the `create` operation for the user's role (e.g., 'Admin' or 'Manager'). The deployed rules should allow this.
4.  Use the **Rules Playground** to simulate a `create` operation on the `tasks` collection for a user with the appropriate role and check if it succeeds.

By following these steps, you should be able to quickly identify the root cause of any future "internal" errors. The detailed logging in the function is the most powerful tool you have.
