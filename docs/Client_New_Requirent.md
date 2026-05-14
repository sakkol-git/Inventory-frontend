Here is your **improved, fully structured, and professionally clarified requirement document** for your existing project.

I rewrote it to be:

* Clear
* Technically specific
* Ready for developer implementation
* Database-friendly
* Suitable for system design documentation

---

# 🌱 System Name Update

## 1. System Rename

**Old Name:** (Existing System Name)
**New Name:** **Plant Lap Laboratory**

* Update system name in:

  * System configuration
  * Navbar / Header
  * Login page
  * System metadata
  * Database system settings (if exists)
  * All official documents and reports

---

# 📦 Inventory Module Enhancements

---

## 2. Plant Hierarchy Extension

### Current Structure

```
Plant Species
```

### New Required Structure

```
Plant Species
   ├── Plant Variety
   └── Plant Sample
```

### 2.1 New Low-Level Product: Plant Variety / Plant Sample

Each **Plant Species** can have **multiple Plant Varieties or Plant Samples**.

### Relationship

* One Species → Many Varieties
* One Species → Many Samples
* Each Variety/Sample belongs to ONE Species

---

### 2.2 Required Fields for Plant Variety / Sample

Each variety or sample must contain:

1. **Unique Identification Code**

   * Auto-generated OR manually input
   * Must be unique in database
   * Example: `PS-VAR-0001`

2. **Ownership**

   * Belongs to a User (Student / Department)
   * Must display:

     * In product card
     * In product list
     * In product detail page
   * Ownership should reference:

     * User ID
     * User Name
     * Department (if exists)

3. **Origin Location**

   * Text field
   * Required
   * Example:

     * Province
     * Country
     * GPS (optional future enhancement)

4. **Other Suggested Fields (Recommended for Completeness)**

   * Description
   * Date Brought to Lab
   * Status (Active / Archived / Destroyed)
   * Images
   * Notes

---

### 2.3 Database Structure Suggestion

**Table: plant_species**

* id
* name
* khmer_name (NEW FIELD)
* description
* created_at

**Table: plant_varieties**

* id
* species_id (FK)
* unique_code
* ownership_user_id (FK)
* origin_location
* description
* created_at

---

## 3. Species Product Adjustment

### Add Khmer Name Field

For each Plant Species:

Add new field:

* **Khmer Name**

  * Required
  * Display in:

    * Product card
    * Product detail
    * List view
    * Form
  * Stored in database

---

## 4. Chemical Product Quantity Management

### Required Feature:

Chemical product must support:

* Increase quantity
* Reduce quantity

### Required Fields:

* Current quantity
* Unit (g, kg, ml, L, etc.)

### Required Behavior:

* When chemical is used → reduce quantity
* When restocked → increase quantity
* Must not allow negative values
* Log every quantity change (Recommended)

### Suggested Log Table:

chemical_logs

* chemical_id
* action_type (add / reduce)
* amount
* user_id
* timestamp

---

# 👤 User Module Enhancement

---

## 5. Standard User Profile Page

Each user must have a profile page containing:

### Profile Information

* Profile Image (upload)
* Full Name
* Role
* Department (optional if exists)
* Contact Information (optional future enhancement)

---

## 6. Research Achievement Management (CRUD)

Each user must be able to:

* Create
* View
* Edit
* Delete

Their own Research Achievements.

### Achievement Fields:

* Title
* Description
* Image
* Document Link (Google Drive / PDF / URL)
* Date
* Status (Published / Draft optional)

### Rules:

* Users can only manage their own achievements.
* Admin & Lab Manager can view all.

---

# 💼 Business Module Expansion

---

## 7. New Business Product: Lab Service

### Description:

Client requests laboratory to conduct:

* Research
* Experiments
* Disease testing
* Protection method analysis
* Scientific testing

---

### Lab Service Fields:

* Service Title
* Client Name
* Client Contact
* Service Description
* Assigned Lab Staff
* Start Date
* End Date
* Status:

  * Pending
  * In Progress
  * Completed
  * Delivered
* Result Summary
* Final Report File Upload
* Service Fee
* Payment Status

---

### Workflow:

1. Client submits request
2. Lab Manager assigns staff
3. Staff performs experiment
4. Result uploaded
5. Client receives report

---

# 🔐 Role & Permission System

---

## 8. User Roles

### 1️⃣ Admin

* Full system access
* Manage users
* Manage roles
* Manage all modules
* Delete any data

---

### 2️⃣ Lab Manager

* Full access to:

  * Inventory
  * Business module
  * User achievements (view)
* Cannot delete system
* Cannot change system configuration

---

### 3️⃣ Lab Assistant

* Can:

  * Input inventory data
  * Update chemical quantities
  * Create lab service entries
  * View own profile
  * Manage own achievements
* Cannot:

  * Delete species
  * Manage roles
  * Access system settings

---

# 🏗 Structural Recommendations

---

## Access Control

Implement:

* Role-based access control (RBAC)
* Middleware permission checking
* Ownership-based restrictions

---

## UI Requirements

* Display ownership badge on product card
* Show Khmer + English names for species
* Clean hierarchy view for:

  * Species
  * Variety
  * Sample

---

# 📊 Summary of Major Enhancements

| Module    | Enhancement                         |
| --------- | ----------------------------------- |
| System    | Rename to Plant Lap Laboratory      |
| Inventory | Add Variety/Sample level            |
| Inventory | Add Khmer name to species           |
| Inventory | Chemical quantity adjustment system |
| User      | Standard profile system             |
| User      | Achievement CRUD                    |
| Business  | New Lab Service product             |
| Roles     | 3-Level permission system           |


