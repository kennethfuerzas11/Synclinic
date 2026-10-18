SYNCLINIC: A BOOKING SYSTEM
========================================================================

Course & Section: CPSOFT1L
Repository: https://github.com/kennethfuerzas11/Synclinic

------------------------------------------------------------------------
PROJECT OVERVIEW
------------------------------------------------------------------------
Synclinic is a streamlined clinic appointment and reservation booking 
system designed to simplify patient scheduling, clinic management, and 
consultation workflows for NU Fairview Clinic

------------------------------------------------------------------------
DEVELOPMENT TEAM / GROUP MEMBERS
------------------------------------------------------------------------
1. Fuerzas, Kenneth (Lead / Repository Owner)
2. Arcangel, Ahren
3. Banez, Mhyca
4. Delamide, Rainniel
5. Higuchi, Kenji
6. Mallari, Rasheed
7. Santos, Jared
8. Tuazon, Tom

------------------------------------------------------------------------
KEY FEATURES
------------------------------------------------------------------------
* Online Appointment Scheduling & Management
* Patient Records & Booking Logs
* Doctor / Clinic Schedule Administration
* Clean and Responsive User Interface

------------------------------------------------------------------------
GETTING STARTED
------------------------------------------------------------------------
1. Clone the repository:
   git clone https://github.com/kennethfuerzas11/Synclinic.git

2. Navigate into the project directory:
   cd Synclinic

3. Follow project setup instructions in the source directory.

------------------------------------------------------------------------
FIREBASE HOSTING
------------------------------------------------------------------------
The app is served locally until it is deployed. To publish it on Firebase
Hosting, install Node.js, authenticate with the Firebase account that owns
the project, then run these commands from the repository root:

   npx firebase-tools login
   npx firebase-tools deploy --only hosting --project synclinic-563b5

The Hosting URL is https://synclinic-563b5.web.app.

Clinic staff use the separate portal at https://synclinic-staff.web.app.
The main site is for student and faculty accounts; the staff portal supports
clinic staff sign-in and registration. Both sites use the same Firebase
Authentication, Firestore, and Storage project. Registration creates a real
Firebase Authentication account and profile. Email verification and
administrator approval are not required. There is no demo staff account.

Deploy both Hosting sites together:

   npx firebase-tools deploy --only hosting --project synclinic-563b5

Deploy Firestore and Storage rules separately when changed:

   npx firebase-tools deploy --only firestore:rules --project synclinic-563b5
   npx firebase-tools deploy --only storage --project synclinic-563b5

Any valid email address accepted by Firebase Authentication can be used for
student, faculty / employee, or clinic staff accounts. IDs can use any
non-empty format up to 100 characters. Password recovery emails are sent
through Firebase Authentication; configure email templates and authorized
domains in Firebase Console.

Bookings must match the name and ID stored in the signed-in profile. The
current project has no
connected university roster or NUIS identity-verification API, so it cannot
independently prove that a submitted name and ID belong to that email address.
Roster-backed identity verification requires an approved university data source.

Appointment completion uploads a PDF or image (maximum 10 MB) to Firebase
Storage and requires doctor remarks. Enable the project's Storage bucket
before deploying `Firebase/Database/storage.rules`. The staff dashboard exports
completed appointments only.
