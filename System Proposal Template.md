
Page
5
of 5
# System Request Document
## Table of Content
1. System Request
2. Work Plan
3. Feasibility Analysis
1. Technical Feasibility
2. Organizational Feasibility
4. Requirements Definition
1. Functional Requirement
2. Non-functional Requirement
5. Logical Design
1. Sequence Diagram
2. Use Cases
3. Process Modeling (Data Flow Diagram)
1. Level 0 Diagram
2. Level 1 Diagram
3. Level 2 Diagram
4. Level 3 Diagram
5. Level 4 Diagram
6. Level 5 Diagram
4. Data Modeling (Entity Relationship Diagram)
5. Structure Chart Diagram
6. Appendices
## Executive Summary
> A summary of all the essential information in the proposal so
that a busy executive can read it quickly and decide what parts
of the plan to read in more depth.
## 1. System Request
> *Reference Chapter 1*
**Project Sponsor:** Carmella Herrera, General Manager, Client
Services Business Unit
**Business Need:** This project has been initiated . . .
**Business Requirements:** Using this system from our . . .
**Business Value:** The Client Services business unit . . .
**Special Issues or Constraints:** The capabilities described . .
.
## 2. Work plan
> **1. Project Scope and Planning:**
- Objective: Develop a bulletin board app for our club to facilitate communication and collaboration among members.
- Target Audience: Club members including students, faculty, and staff.  
> **2. Market Research:**
- Analyze existing bulletin board apps like Trello, Slack, and Asana.
- Conduct surveys among club members to gather feedback on their preferences and pain points.  
> **3. Feature Set Definition:**
- Essential Features:
    - User registration and login
    - Posting announcements, events, and updates
    - Commenting and discussion threads
    - Notifications for new posts and comments
    - Search functionality
    - User profiles with customizable settings  
> **4. UI/UX Design:**
- Wireframes and Mockups: Sketch or Adobe XD
- User Flows: Diagrams to illustrate user interaction paths
- Design Iterations: Incorporate feedback from stakeholders and potential users  
> **5. Development:**
- Set up a development environment with the necessary tools and libraries.
- Start with backend development: User authentication, posting, and commenting APIs.
- Develop frontend components and integrate with backend APIs.
- Conduct regular code reviews and testing during development sprints.  
> **6. Testing and Quality Assurance:**
- Functional Testing: Test all features to ensure they work as expected.
- Usability Testing: Gather feedback from a sample of club members to evaluate the user experience.
- Bug Fixing: Address any issues or bugs discovered during testing.  
> **7. Deployment:**
- Set up production servers and deploy the app.
- Configure domain and SSL certificates for security.
- Perform final checks to ensure the app is ready for launch.  
> **8. Launch and Marketing:**
- Plan a launch strategy including announcements on social media and email newsletters.
- Encourage club members to download and start using the app.
- Gather feedback from early users and iterate based on their suggestions.  
> **9. Maintenance and Updates:**
- Monitor app performance and user feedback post-launch.
- Regularly update the app with new features and improvements.
- Address any security vulnerabilities promptly.  
> **10. Community Building:**
- Foster a sense of community through in-app engagement features like user-generated content and discussions.
- Organize virtual or in-person events to promote app usage and interaction among members.  
> **11. Analytics and Iteration:**
- Implement analytics tools to track user engagement, retention, and feature usage.
- Analyze data to identify patterns and areas for improvement.
- Continuously iterate and optimize the app based on user feedback and analytics insights.  
### Gantt Chart
![College Connect Gantt Chart](https://github.com/YoungSnook/System_Proposal_CIS_474/assets/156803738/3aea0c23-3a4d-421b-8eb3-0ef6b515fe29)
## 3. Feasibility Analysis
### 3.1 Technical Feasibility:​
**- Skill and Expertise:** We have our team of four developers with expertise in development. However, additional resources may be required for specialized tasks or technologies.​  
**- Technology Stack:** Our team has some experience working with these technologies, which will facilitate the development process.​  
**- Integration:** The app will integrate with existing club management systems for user authentication and event management.  
### 3.2 Operational Feasibility:
**- Resource Availability:** A budget may be a concern, but our team can discuss securing any funding for the project.​  
**- Organizational Impact:** Our team will provide training and support to any user to ensure a smooth transition to the app, and actively request feedback to address any concerns or issues.​  
**- User Acceptance:** User feedback will be built into the app through development, which demonstrates our commitment to user satisfaction and continuous improvement.  

## 4. Requirements Definition

### 4.1 Functional Requirements:
1. **User registration and authentication**   <br>
Users shall be able to login securely to access the system.

2. **Club listings and search**   <br>
Allow users to seach clubs based on various criteria such as meeting times, genre, or events.

3. **Club registration**   <br>
Allow users to register for clubs they are eligible for.   <br>
Enforce limits on the number of students that can register for each club.
### 4.2 Nonfunctional Requirements:
1. **Performance:**    <br>
The system should respond to user actions within 6 seconds.

2. **Reliability**   <br>
The system should have minimal downtime for maintenance or upgrades.

3. **Useability**  <br>
The user interface shall be intuitive and easy to navigate.   <br>
The system shall be restricted to current Messiah students.

## 5. Logical Design
> A set of use cases that illustrate the basic processes that the
system needs to support.
### 5.1 Sequence Diagram
```mermaid
sequenceDiagram
actor J as John
participant S as System
S->>J: Enter user name and password
J-->>S: Types username and password
```
### 5.2 Use Cases
<img width="679" alt="Screenshot 2024-05-02 at 12 03 14 AM" src="https://github.com/YoungSnook/System_Proposal_CIS_474/assets/156804462/2d147376-42d3-44b2-b5c4-28ea5b9350f7">

### 5.3 Process Model (Data Flow Diagram)
> A set of process models and descriptions for the tois system
that will be replaced.
### 5.4 Data Model (Entity Relationship Diagram)
<img width="884" alt="Screenshot 2024-05-01 at 10 49 39 PM" src="https://github.com/YoungSnook/System_Proposal_CIS_474/assets/156804462/166be2ce-0498-407a-85b7-564668d9ae74">

### 5.4 Structure Chart Diagram
![Simple org chart](https://github.com/YoungSnook/System_Proposal_CIS_474/assets/161474744/4b553023-b0cf-4191-b4e9-ec27166251fc)

## 6. Appendices
> These contain additional material relevant to the proposal,
often used to support the recommended system. This might include
results of a questionnaire survey or interviews, industry reports
and statistics, etc.
