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
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // Check if the user has an allowed role
    const userRole = context.auth.token.role;
    if (!['Admin', 'Manager', 'Designer'].includes(userRole)) {
        throw new HttpsError('permission-denied', 'You do not have permission to create a task.');
    }

    // Basic validation (more robust validation should be added based on Zod schema)
    if (!data.clientName || !data.services || !Array.isArray(data.services) || data.services.length === 0) {
        console.error("Validation failed for task data:", data);
        throw new HttpsError("invalid-argument", "The function must be called with a valid task payload. Required fields: clientName, services.");
    }

    // Prepare data for Firestore
    const taskData = {
        ...data,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        status: "not_started",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        creatorUid: context.auth.uid, // Track who created the task
    };

    try {
        const taskRef = await db.collection("tasks").add(taskData);
        console.log("Task created with ID: ", taskRef.id);
        return { status: "success", taskId: taskRef.id };
    } catch (error) {
        console.error("Error creating task in Firestore:", JSON.stringify(error, null, 2));
        throw new HttpsError("internal", "Failed to create task in Firestore.");
    }
});