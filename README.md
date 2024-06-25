# Custom Lens - A Powerful Tool for Data Exploration

This repository contains the code for **Custom Lens**, a powerful tool designed to help you explore and analyze your data in a flexible and intuitive way. 

## What is the Well-Architected tool

AWS Well-Architected Tool (AWS WA Tool) is a service in the cloud that provides a consistent process for measuring your architecture using AWS best practices. AWS WA Tool helps you throughout the product lifecycle by:

* Assisting with documenting the decisions that you make

* Providing recommendations for improving your workload based on best practices

* Guiding you in making your workloads more reliable, secure, efficient, and cost-effective

You can use AWS WA Tool to document and measure your workload using the best practices from the AWS Well-Architected Framework. These best practices were developed by AWS Solutions Architects based on their years of experience building solutions across a wide variety of businesses. The framework provides a consistent approach for measuring architectures and provides guidance for implementing designs that scale with your needs over time.

**What is Custom Lens?**

Custom Lens is a custom-built data exploration tool that allows you to:

* **Define your own data sources:** Connect to various data sources like Google Cloud Storage, BigQuery, and more.
* **Create custom visualizations:** Build interactive charts and dashboards to visualize your data in meaningful ways.
* **Apply filters and transformations:** Easily manipulate your data to gain deeper insights.
* **Share your findings:** Export your visualizations and analysis results for collaboration and reporting.

Getting Started

## Clone the repository

```bash
   git clone https://github.com/your-username/customLens.git
```

##  Install dependencies:

```bash
cd customLens
npm install
```

##  Configure your environment:

Create a .env file in the root directory and set the necessary environment variables (e.g., data source credentials, API keys).
Refer to the README.md files within the public/training directory for specific instructions on configuring your data sources.
Run the application:

```bash
npm start
```
##  Project Structure

```
public/training: Contains training materials and examples for using Custom Lens.
node_modules: Contains project dependencies.
.git: Git repository files.
.env: Environment variables for the application.
lens*.md: Documentation files for Custom Lens.
customLens.son: Configuration file for Custom Lens.
buildlens.json: Build configuration file for Custom Lens.
lens.yml: Configuration file for Custom Lens.
```

## Contributing

We welcome contributions to Custom Lens! If you have any suggestions, bug reports, or feature requests, please feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License.

Let's explore your data together!
