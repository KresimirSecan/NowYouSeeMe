# Neural Network Visualization Tool 

Welcome to an intuitive neural network visualization tool designed to help you understand and visualize the inner workings of neural networks. This guide will assist you in setting up, running, and effectively utilizing the tool on your local machine.

## Table of Contents
- [Introduction](#introduction)
- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Usage Guide](#usage-guide)
  - [Loading the Data](#loading-the-data)
  - [Creating a Neural Network](#creating-a-neural-network)
  - [Training the Network](#training-the-network)
  - [Evaluating Performance](#evaluating-performance)
  - [Visualizing the Network](#visualizing-the-network)
- [Components Overview](#components-overview)
  - [Network Architecture](#network-architecture)
  - [Layers](#layers)
  - [Activation Functions](#activation-functions)
  - [Loss Functions](#loss-functions)
  - [Optimizers](#optimizers)

## Introduction

**NowYouSeeMe** is an open-source JavaScript application that enables users to build, train, and visualize neural networks directly in their browser. Whether you're a beginner trying to understand neural networks or an experienced developer looking for a visualization tool, NowYouSeeMe provides an interactive and user-friendly experience.

## Features

- **Intuitive Visualization:** Observe how data flows through the network and understand the effects of different layers and activation functions.
- **Interactive UI:** Modify the network architecture, adjust parameters, and observe changes in the network's behavior.
- **Customizable Networks:** Build networks from scratch by choosing your own layers and other components.
- **Educational Tool:** Ideal for learning and teaching neural networks, offering a clear view of how different components work together.

## Requirements

Ensure your system meets the following requirements before getting started:

- **Operating System:** Any OS with a modern web browser (Windows, macOS, Linux).
- **Web Browser:** A modern web browser, for best performance use Google Chrome.
- **Node.js:** Ensure Node.js is installed on your system if you plan to run the tool locally. You can download it from the [official Node.js website](https://nodejs.org).

## Installation

Follow these steps to get started with NowYouSeeMe:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/KresimirSecan/NowYouSeeMe/tree/develop
   ```

2. **Navigate to the project directory:**

   ```bash
   cd path/to/NowYouSeeMe
   ```
   
   Now you're ready to run the application.

## Running the Project

To launch the application, follow these steps:

1. **Start the server:**

   ```bash
   npx serve
   ```

2. **Access the tool:**  
   Open your web browser and navigate to `http://localhost:3000` (or your default localhost port) to access the application.

3. **Explore the interface:**  
   Use the graphical interface to start building and visualizing neural networks.

## Usage Guide

### Loading the Data

Your data should be in `.csv` format, with one column containing labels and the remaining columns containing numerical values representing pixel data.

**Example:**

| label | 1x1 | 1x2 | 1x3 | 1x4 | 1x5 | 1x6 | 1x7 | 1x8 | 1x9 | 1x10 | ... |
|-------|-----|-----|-----|-----|-----|-----|-----|-----|-----|------|-----|
| 7     | 1   | 0   | 121 | 0   | 0   | 5   | 0   | 0   | 166 | 0    | ... |

You can find an example dataset [here](https://www.kaggle.com/datasets/oddrationale/mnist-in-csv?resource=download).

Load your `.csv` file through the "Loading Data" section of the interface. Select the percentage of data for testing, choose the label column, and click "Submit". A pop-up will notify you once the data is successfully loaded.

### Creating a Neural Network

To develop and manage neural networks, the software utilizes TensorFlow.js. In the "Architecture" section, you can add, remove, or edit layers of your neural network. Once configured, click "Render" to visualize your network structure.

### Training the Network

Configure training parameters like the number of epochs and batch size, or use default values. Click the "Train" button to start training and a pop-up will appear. Watch the training process in real-time, with visual feedback on how the network learns over time.

### Evaluating Performance

After training, the tool will evaluate your network using the test data, displaying the accuracy to assess the network’s performance.

### Visualizing the Network

The software uses Three.js to visualize the structure of your neural network graphically. You can explore how data flows through the network by inputting a test data index and clicking "Predict". Navigate the 3D environment using WASD for movement and Q/E for vertical adjustments.

## Components Overview

### Network Architecture
The architecture of a neural network defines its structure and how data flows through the model.
In this implementation, the architecture can be customized using the **CustomModel** class, which extends TensorFlow's `tf.Sequential`. 
This allows for the creation of bespoke neural network architectures tailored to specific tasks. The `CustomModel` class provides flexibility in stacking layers sequentially,
enabling the design of complex models suited for various types of data and objectives. By leveraging this approach, you can define intricate neural networks that precisely match 
the needs of your application, ensuring optimal performance and adaptability.

### Layers
Layers are responsible for transforming input data into meaningful patterns through various operations. 
In this model, **dense layers** are used, which fully connect each neuron from the input to the output. 
The layers are added using the `tf.layers.dense()` method, a powerful tool that allows the specification of the number of neurons and the activation functions applied at each layer. 
Dense layers are essential for enabling the network to learn complex representations of data by mapping input features to output predictions through weighted connections and nonlinear activations.

### Activation Functions
Activation functions introduce non-linearity into the network, enabling it to learn and model complex patterns. 
Different activation functions are applied in different layers to achieve the desired output behavior:

- **ReLU6:** The ReLU6 activation function is a variant of the standard ReLU function that caps the output at 6.
- This function is commonly used in hidden layers to introduce non-linearity while preventing the output from growing too large.
- The capping at 6 can be particularly useful in scenarios where you want to limit the range of activation values, ensuring that the network remains stable during training.

$$
\text{ReLU6}(x) = \min(\max(0, x), 6)
$$

- **Softmax:** The Softmax activation function is typically used in the output layer of classification models, especially when dealing with multi-class problems.
It converts raw logits into probabilities, with each class receiving a probability score between 0 and 1.
The scores across all classes sum to 1, making it ideal for interpreting the output as a probability distribution over different classes.

$$
\text{Softmax}(x_i) = \frac{e^{x_i}}{\sum_{j} e^{x_j}}
$$

### Loss Functions
Loss functions measure how well the model’s predictions match the actual target values. They are critical for guiding the optimization process:

- **Mean Squared Error (MSE):** The Mean Squared Error (MSE) loss function calculates the average of the squared differences between predicted values and actual target values.
- It is widely used in regression tasks, but in this model, it is employed for simplicity. MSE penalizes larger errors more than smaller ones,
- making it suitable for scenarios where the magnitude of prediction errors is important.

$$
\text{MSE}(y, \hat{y}) = \frac{1}{m} \sum_{i=1}^{m} (y_i - \hat{y}_i)^2
$$

### Optimizers
Optimizers play a crucial role in training neural networks by iteratively adjusting the model parameters to minimize the loss function.
The choice of optimizer affects the speed and efficiency of convergence during training:

- **Stochastic Gradient Descent (SGD):** Stochastic Gradient Descent is a fundamental optimization algorithm that updates the model parameters iteratively in the
- direction that minimizes the loss function. It computes the gradient of the loss with respect to each parameter and updates the parameters by subtracting a fraction of the gradient,
- determined by the learning rate. This approach is simple yet powerful, and it is widely used in machine learning for its effectiveness in optimizing models.

$$
\theta = \theta - \alpha \nabla J(\theta)
$$

In this implementation, SGD is chosen for its straightforwardness and ability to efficiently optimize the model, making it a reliable choice for various tasks.


### Thank you for using NowYouSeeMe! We hope this tool enhances your understanding of neural networks and contributes to your learning or  development projects. Happy visualizing!
