# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

EdidReader is an open source online EDID parser built with AngularJS 1.0.3. The project parses Extended Display Identification Data (EDID) from monitors and displays, allowing users to view detailed display capabilities, timing information, and vendor specifications.

## Development Commands

### Running the Development Server
```bash
node scripts/web-server.js [port]
```
Default port is 8000. Navigate to `http://localhost:8000/app/index.html` to view the application.

### Running Tests
```bash
# Unit tests (requires Testacular/Karma)
./scripts/test.sh        # Linux/Mac
scripts/test.bat         # Windows

# E2E tests  
./scripts/e2e-test.sh    # Linux/Mac
scripts/e2e-test.bat     # Windows
```

Tests use Testacular (now Karma) with Jasmine. Unit tests are in `test/unit/`, e2e tests in `test/e2e/`.

## Architecture

### Core Structure
- `app/` - Main application code
  - `js/edid.js` - Core EDID parsing logic and data structures
  - `js/controllers.js` - AngularJS controllers
  - `js/services.js` - AngularJS services
  - `js/directives.js` - Custom directives
  - `partials/` - HTML templates organized by EDID block types
- `test/` - Test files mirroring app structure
- `scripts/` - Development tools and web server

### Key Components

**EDID Parser (`app/js/edid.js`)**
- Main `Edid()` constructor with parsing constants and enums
- Handles EDID block parsing, timing descriptors, and vendor-specific data
- Contains lookup tables for display modes, color spaces, and timing information

**Angular App (`app/js/app.js`)**
- Module definition: `myApp` with dependencies on filters, services, directives, and `angularTreeview`
- Simple routing configuration

**Partials Structure**
- `block0/` - Basic EDID block 0 parsing (header, display parameters, timing)
- `blockX/` - Extension blocks (CEA, vendor-specific data blocks)
- `edid/` - Main EDID input and parsed data display

### Data Flow
1. User inputs EDID hex data via text input
2. EDID parser validates and processes the data
3. Parsed information is displayed in hierarchical view using angular-treeview
4. Different EDID blocks render using specific partial templates

## Testing
The project uses Testacular (Karma) with Jasmine for unit testing. Test configuration is in `config/testacular.conf.js`. Tests cover controllers, directives, filters, and services.

## Dependencies
- AngularJS 1.0.3 (in `app/lib/angular/`)
- Bootstrap CSS framework
- angular-treeview for hierarchical data display
- jQuery 1.8.3
- UI Bootstrap 0.3.0