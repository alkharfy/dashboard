import * as admin from "firebase-admin";
import * as functions from "firebase-functions";
import { HttpsError } from "firebase-functions/v1/https";

admin.initializeApp();

const db = admin.firestore();

/**
 * Sets a custom claim on a new user to give them the 'designer' role by default.
 * Also creates a corresponding user document in the 'users' collection.
 */
export const setUserRole = functions.auth.user().onCreate(async (user) => {
  if (user.email && user.uid) {
    try {
      // Set default role as 'designer'
      await admin.auth().setCustomUserClaims(user.uid, { role: "designer" });

      // Create user profile in Firestore
      const userRef = db.collection("users").doc(user.uid);
      await userRef.set({
        name: user.displayName || "New User",
        email: user.email,
        role: "designer",
        status: "available",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      console.log(`Custom claim set for user ${user.uid} and user document created.`);
    } catch (error) {
      console.error("Error setting custom claim or creating user doc:", error);
    }
  }
});


/**
 * A callable function to create a new task in Firestore.
 */
export const createTask = functions.https.onCall(async (data, context) => {
    // Check if the user is authenticated
    if (!context.auth) {
        console.error("Function called by unauthenticated user.");
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // Check if the user has an allowed role
    const userRole = context.auth.token.role;
    if (!['Admin', 'Manager', 'Designer'].includes(userRole)) {
        console.error(`User with role '${userRole}' attempted to create a task.`);
        throw new HttpsError('permission-denied', 'You do not have permission to create a task.');
    }

    // Basic validation
    if (!data.clientName || !data.services || !Array.isArray(data.services) || data.services.length === 0) {
        console.error("Validation failed for task data:", data);
        throw new HttpsError("invalid-argument", "The function must be called with a valid task payload. Required fields: clientName, services.");
    }

    // Prepare data for Firestore, ensuring skills is an array of strings.
    const taskData = {
        ...data,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        // The frontend sends `skills` as a string, but the schema expects an array.
        // This handles both cases to prevent errors.
        skills: Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        status: "not_started",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        creatorUid: context.auth.uid,
    };

    try {
        const taskRef = await db.collection("tasks").add(taskData);
        console.log("Task created with ID: ", taskRef.id);
        return { status: "success", taskId: taskRef.id };
    } catch (error) {
        console.error("Error creating task in Firestore:", JSON.stringify(error, null, 2));
        // This will give a more generic but safer error to the client.
        throw new HttpsError("internal", "An unexpected error occurred while creating the task.");
    }
});
