variable "location" {
    description = "The Azure Region in which all resources will be created."
    default     = "West Europe"
}

variable "name" {
    description = "The name of the application."
    default     = "hubmhot2"
}

variable "environment" {
    description = "The environment in which the application will be deployed."
    default     = "hub04"
}
