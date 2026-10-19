
Can you create agents and skills?
I would like to build an iterative multi-agent workflow composed of three agents that continuously refine an application concept. The process should work as follows:

1. Initial Input
- The user provides a high-level application idea, including requirements, constraints, and general considerations.
- This information is stored in a file named 1_input.md.
2. Architect Agent
- Reads the most recent x_input.md file.
- Analyzes the requirements and produces a concise but detailed functional and technical specification.
- Saves the result as 1_specification.md (or x_specification.md for subsequent iterations).
3. Developer Agent
- Reads the latest x_specification.md file.
- Creates a detailed implementation and deployment plan describing how the application should be built and delivered.
4. Customer Review Agent (Demanding Customer)
- Acts as a critical and demanding customer.
- Reviews the proposed application from multiple perspectives, including: 
- Business value
- Features and functionality
- User experience (UX)
- User interface (UI)
- Modern design standards
- Competitive market practices
- Customer attractiveness and usability
- Generates recommendations, enhancements, and new requirements to improve the product.
- Outputs these recommendations into a new file named 2_input.md.
5. Iteration Loop
- The process repeats using the newly generated input file.
- The Architect Agent reads 2_input.md and creates 2_specification.md.
- The Developer Agent generates a new implementation plan based on the updated specification.
- The Customer Review Agent evaluates the result again and generates 3_input.md.
- This cycle continues for as many iterations as desired, progressively refining the application requirements, design, and implementation plan until the solution reaches the desired quality level.
Goal
The objective is to create a continuous feedback loop where each iteration improves the application by combining:

- Architectural analysis (Architect Agent)
- Implementation planning (Developer Agent)
- Critical customer feedback (Customer Review Agent)
This process should progressively transform a high-level idea into a well-defined, customer-focused, and implementation-ready solution.
