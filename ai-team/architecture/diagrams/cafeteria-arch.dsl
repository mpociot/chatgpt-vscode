workspace {
  model {
    user = person "Employee"
    staff = person "Cafeteria Staff"
    system = softwareSystem "Cafeteria Management System" {
      containers {
        webApp = container "Web Application" {
          uses database, "Reads/Writes data to"
          uses paymentGateway, "Processes Payments via"
          uses orderService, "Places Orders via"
          uses menuService, "Fetches Menus from"
        }

        database = container "Database" {
          technology = "Relational Database"
        }

        paymentGateway = container "Payment Gateway" {
          technology = "External Service"
        }

        orderService = container "Order Service" {
          technology = "Microservice"
          uses database, "Stores Orders in"
        }

        menuService = container "Menu Service" {
          technology = "Microservice"
          uses database, "Stores Menus in"
        }
      }

      views {
        systemContext webApp {
          include *
          autoLayout
        }

        containerDiagram webApp {
          include *
          autoLayout
        }
      }
    }
  }

  views {
    configuration {
      theme "Cafeteria Management System" {
        font "Roboto", "14", "#ffffff"
        background "#363636"
        border "#d3d3d3"
      }
    }
  }
}