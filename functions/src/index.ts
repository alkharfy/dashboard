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
 * It performs validation and ensures the caller has the correct role.
 */
export const createTask = functions.https.onCall(async (data, context) => {
    // 1. Authentication Check
    if (!context.auth) {
        console.error("Function called by unauthenticated user.");
        throw new HttpsError("unauthenticated", "The function must be called while authenticated.");
    }

    // 2. Role-Based Access Control (RBAC)
    const userRole = context.auth.token.role;
    if (!['Admin', 'Manager'].includes(userRole)) {
        console.error(`User with role '${userRole}' attempted to create a task.`);
        throw new HttpsError('permission-denied', 'You do not have permission to create a task.');
    }

    // 3. Payload Validation
    const requiredFields = ['clientName', 'services', 'jobTitle', 'education', 'experienceYears', 'skills', 'paymentMethod', 'paymentStatus'];
    const missingFields = requiredFields.filter(field => data[field] === undefined || data[field] === null);

    if (missingFields.length > 0) {
        const errorMsg = `Missing required fields: ${missingFields.join(', ')}`;
        console.error("Validation failed:", errorMsg, "Payload:", data);
        throw new HttpsError("invalid-argument", errorMsg);
    }

    if (!Array.isArray(data.services) || data.services.length === 0) {
        const errorMsg = "The 'services' field must be a non-empty array.";
        console.error("Validation failed:", errorMsg, "Payload:", data);
        throw new HttpsError("invalid-argument", errorMsg);
    }

    // 4. Data Preparation
    const taskData = {
        ...data,
        clientName: data.clientName,
        birthdate: data.birthdate ? new Date(data.birthdate) : null,
        contactInfo: data.contactInfo || {},
        jobTitle: data.jobTitle,
        education: data.education,
        experienceYears: Number(data.experienceYears) || 0,
        skills: Array.isArray(data.skills) ? data.skills : (typeof data.skills === 'string' ? data.skills.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
        services: data.services,
        paymentMethod: data.paymentMethod,
        paymentStatus: data.paymentStatus,
        status: "not_started",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        creatorUid: context.auth.uid,
        attachments: [], // Initialize as empty array
    };

    // 5. Firestore Write Operation
    try {
        const taskRef = await db.collection("tasks").add(taskData);
        console.log("Task created successfully with ID: ", taskRef.id);
        return { status: "success", taskId: taskRef.id };
    } catch (error) {
        console.error("CRITICAL: Error creating task in Firestore:", JSON.stringify(error, null, 2));
        // This is the final catch-all. It's better to be specific above.
        throw new HttpsError("internal", "An unexpected error occurred while writing to the database.");
    }
});
