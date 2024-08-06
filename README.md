# About
This project started off without a grid system, just to see if I could make a ball move from a start coordinate to an end location. However, I later developed it into the version I have today after working on a similar grid-based Q-learning system in a [LEGO Spike research project](https://github.com/iliketocode2/Lego-Spike-AI-Labyrinth). 

# Reward System and Q-learning

### Overview:
Q-learning is a type of reinforcement learning algorithm that works in state-action pairs. It generates a 'Q-value' for each state-action pair, which represents the expected future rewards of taking that action in that state. The goal is to maximize the total reward over time. For this project, each state is the position of the ball on the mini-golf grid.Each action is either up, down, left, or right.
### Algorithm:
Upon initialization, an empty Q-table with Q-values set to zero is created. The Q-table is a mapping from state-action pairs to Q-values.
For each action, update the Q-value using the formula: Q(s,a)←Q(s,a)+α(r+γ max(a') Q(s′,a′)−Q(s,a)) where α is the learning rate (how much new information overrides the old) and γ is the discount factor (how much future rewards are considered). For further reading, explore [this article](https://www.geeksforgeeks.org/q-learning-in-python/) from GeeksForGeeks.

Note: If you enclose the ball in walls, the program will run forever as I didn't yet implement behavior for that scenario. Also, the algorithm currently does not have a case when the ball gets stuck, so there are certain map configurations that will continue to run and run. 

# Instructions
1. Using the dropdown menu at the bottom of the grid, select the drawing mode (walls, sand, or hole).
2. Draw the mini golf field on the grid, and make sure to place a hole or the program will not run.
3. Adjust the speed of each step (for visualization) and the maximum number of attempts.
4. Press 'Start Simulation' and the ball will start in the upper left-hand corner and make its way to the end.
5. Once the number of attempts you set is reached, the shortest path will be displayed.

![Interface](https://github.com/user-attachments/assets/ce1b0b47-97e3-47eb-9053-fe3d9b44e9b3)
