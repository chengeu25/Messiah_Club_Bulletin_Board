
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
**2. Market Research:**
- Analyze existing bulletin board apps like Trello, Slack, and Asana.
- Conduct surveys among club members to gather feedback on their preferences and pain points.  
**3. Feature Set Definition:**
- Essential Features:
    - User registration and login
    - Posting announcements, events, and updates
    - Commenting and discussion threads
    - Notifications for new posts and comments
    - Search functionality
    - User profiles with customizable settings  
**4. UI/UX Design:**
- Wireframes and Mockups: Sketch or Adobe XD
- User Flows: Diagrams to illustrate user interaction paths
- Design Iterations: Incorporate feedback from stakeholders and potential users  
**5. Development:**
- Set up a development environment with the necessary tools and libraries.
- Start with backend development: User authentication, posting, and commenting APIs.
- Develop frontend components and integrate with backend APIs.
- Conduct regular code reviews and testing during development sprints.  
**6. Testing and Quality Assurance:**
- Functional Testing: Test all features to ensure they work as expected.
- Usability Testing: Gather feedback from a sample of club members to evaluate the user experience.
- Bug Fixing: Address any issues or bugs discovered during testing.  
**7. Deployment:**
- Set up production servers and deploy the app.
- Configure domain and SSL certificates for security.
- Perform final checks to ensure the app is ready for launch.  
**8. Launch and Marketing:**
- Plan a launch strategy including announcements on social media and email newsletters.
- Encourage club members to download and start using the app.
- Gather feedback from early users and iterate based on their suggestions.  
**9. Maintenance and Updates:**
- Monitor app performance and user feedback post-launch.
- Regularly update the app with new features and improvements.
- Address any security vulnerabilities promptly.  
**10. Community Building:**
- Foster a sense of community through in-app engagement features like user-generated content and discussions.
- Organize virtual or in-person events to promote app usage and interaction among members.  
**11. Analytics and Iteration:**
- Implement analytics tools to track user engagement, retention, and feature usage.
- Analyze data to identify patterns and areas for improvement.
- Continuously iterate and optimize the app based on user feedback and analytics insights.  
### Gantt Chart
```mermaid
gantt
dateFormat YYYY-MM-DD
title YOUR PROJECT TITLE HERE
excludes weekends
%% (`excludes` accepts specific dates in YYYY-MM-DD format,
days of the week ("sunday") or "weekends", but not the word
"weekdays".)  
section Section A
Task A.1 : des1, 2014-01-06,2014-01-08
Task A.2 : des2, 2014-01-09, 3d
Task A.3 : des3, after des2, 5d
Task A.4 : des4, after des3, 5d
section Section B
Task B.1 : des5, 2014-01-07,2014-01-09
Task B.2 : des6, 2014-01-10, 7d
Task B.3 : des7, after des3, 2d
Task B.4 : des8, after des7, 5d
section Section C
Task C.1 : des9, 2014-01-06,2014-01-08
Task C.2 : des10, 2014-01-09, 3d
Task C.3 : des11, after des2, 5d
Task C.4 : des12, after des3, 5d
```
## 3. Feasibility Analysis
> *Reference Chapter 1*
> A revised feasibility analysis, using the information from the
analysis phase.
### 3.1 Technical Feasibility
### 3.2 Organizational Feasibility
## 4. Requirements Definition
> *Reference Chapter 3*
> A list of the functional and nonfunctional business
requirements for the system.
### 4.1 Functional Requirements:
### 4.2 Nonfunctional Requirements:
1. **Operational**
2. **Performance**
3. **Security**
4. **Cultural and political**
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
> *Reference Chapter 4*
#### Use Case Name: Your use case name
> __ID__ :
> __Priority__ :
> __Actor__ :
> __Description__ :
> __Trigger__ :
> __Type__ :
> __Preconditions__ :
> 1. Condition 1
> 2. Condition 2
> 3. ......
| Normal Course: | Information for Steps |
|---|---|
|1.0 Finalize Parts Request||
|1. Parts room clerk opens the parts . . . | <--- Parts Request
record |
|2. Parts room clerk verifies . . . |<--- Shop Work Order Record|
> __Postconditions__ :
> 1. Condition 1
> 2. Condition 2
> 3. ......
|Summary Inputs|Source|Summary Outputs| Destination|
|---|---|---|---|
|Final parts verification|Parts room clerk|Parts request record|
Parts room clerk|
|Date/time completion|Parts room clerk|Shop work order record|
Shop work order datastore|
|||Work Order ready notice|Technician|
### 5.3 Process Model (Data Flow Diagram)
> A set of process models and descriptions for the tois system
that will be replaced.
### 5.4 Data Model (Entity Relationship Diagram)
> *Reference Chapter 5*
> A set of data models and descriptions for the tois system that
will be replaced.
### 5.4 Structure Chart Diagram
> *Reference Chapter 9*
## 6. Appendices
> These contain additional material relevant to the proposal,
often used to support the recommended system. This might include
results of a questionnaire survey or interviews, industry reports
and statistics, etc.
