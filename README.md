# Patient-Clinician Portal

A secure platform connecting patients (especially older adults) with verified healthcare professionals, featuring AI-assisted responses with clinical verification.

## 🌟 Project Overview

The Patient-Clinician Portal addresses the critical problem of healthcare misinformation, particularly affecting older adults with limited digital literacy. Our solution provides a trusted environment where patients can access reliable health information through an AI-powered system with clinical verification.

### 🔍 Problem Statement

- **Limited Access to Reliable Information**: Older adults struggle to find trustworthy health resources
- **Risk of Misinformation**: Limited digital literacy may lead to trusting inaccurate health advice
- **Potential Health Consequences**: Incorrect information can cause improper self-diagnosis, medication misuse, or delayed medical intervention
- **AI-Based Chatbot Limitations**: While convenient, AI responses lack medical validation

### 💡 Solution

- **Secure Login & Role-Based Dashboards**: Separate access for patients and verified clinicians
- **AI-Assisted Responses with Disclaimers**: Instant AI replies clearly marked as "Not Verified by Clinicians Yet"
- **Clinician Review & Verification**: Experts approve, edit, or rewrite AI responses for accuracy
- **Elderly-Friendly Accessibility**: Large text, clear navigation, voice-to-text input, and other features for ease of use

## 🛠️ Key Features

### For Patients:
- Three types of response indicators (unverified, verified correct, corrected by clinician)
- Emergency button for urgent clinical responses
- Text-to-speech functionality
- Speech-to-text input capability
- Large text and bright colors for visibility
- Verification notifications
- Simple, intuitive navigation

### For Clinicians:
- Secure login with license verification
- Response verification system (correct/incorrect indicators)
- Specialized routing based on medical specialization
- Dashboard for analytical insights and FAQ

## 💻 Tech Stack

- **MERN Stack**: MongoDB, Express.js, React.js, Node.js - forming the application backbone
- **Tailwind CSS**: Implementing responsive and modern UI design
- **Json Web Token**: Providing secure authentication 

## 👨‍💻 Team

- **Neev Lalit Rathod (2024A7PS0487G)**: Proficient with MERN stack, Figma design, and Canva
- **Abhinav Kumar (2024A1PS0302G)**: Skilled in generative AI and machine learning techniques
- **Parv Agarwal (2024A7PS0646G)**: Expert in Firebase login authentication and Flutter development
- **Arya Chauhan (2024A7PS1441G)**: Experienced in generative AI and ML techniques

## 🔗 Resources

- **Figma Design**: [View Design](https://www.figma.com/design/tD4pHhTFYsrfr383Nx08tb/hackenza-project?node-id=0-1&p=f&t=THNz3sIuBHFMuFH4-0)

## 🚀 Getting Started

Follow these steps to set up the project locally:

1. Clone the repository:
   ```
   git clone [repository-url]
   ```

2. Set up the backend:
   ```
   cd backend
   npm install
   ```

3. Configure environment variables:
   - Edit the `.env` file in the backend folder with your configuration settings

4. Set up MongoDB:
   - Open MongoDB
   - Create a new collection
   - Update your MongoDB connection URL in the backend `.env` file

5. Start the backend server:
   ```
   node ./server.js
   ```

6. Set up the frontend:
   ```
   cd ..
   cd frontend
   npm install
   ```

7. Configure frontend environment variables:
   - Edit the `.env` file in the frontend folder with your configuration settings

8. Start the frontend development server:
   ```
   npm run dev
   ```

9. Access the application in your browser at the URL shown in your terminal

![image](https://github.com/user-attachments/assets/00d877e5-e635-4589-86e2-6eede9b24b0e)
*This is the login register page for both the patient and the cliniic*

![image](https://github.com/user-attachments/assets/001b3f76-64f5-4f0d-a66f-441f2c89e628)
*This is the registration page for the clinic with their specialisation as the fiels helping the routing of the chats for efficient response and uploading of their license for authentication*

![image](https://github.com/user-attachments/assets/cfa73ec5-7c3b-44ae-8aa5-0ce9a204ba73)
*Simple registration for the user*

![image](https://github.com/user-attachments/assets/2b59af34-e082-415b-bacf-aa9dbab5d1dd)
*This is how the chatscreen for user look like*
- A text to speech in the chat for older user to listen to the respone
- A speech to text in the input field
- Emergency button for faster response
- Using of bright colours for clear visibility
- Red colour for incorrect and green colour for correct response and grey colour for unverified response
- Clinic details who have verified the response
  
![image](https://github.com/user-attachments/assets/d7419e0e-c51b-47cd-8d66-f290e42b594c)
![image](https://github.com/user-attachments/assets/261bc9d4-f7f7-4a71-b245-216c0153027b)

*This is the Clinic side UI*
- Two types of button to button for correct and incorrect response and if the response is incorrect a modal to send a correct response
- Three types of button to filter the chats for ease use

![image](https://github.com/user-attachments/assets/0d252eb8-9394-40b0-b256-6be721b4b2fd)
*Role based dashboard for the clinics to analyse their work*







---

*This project was developed as part of a hackathon initiative aimed at improving healthcare access and information reliability for older adults.*
