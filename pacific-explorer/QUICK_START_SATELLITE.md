# WebODM Satellite Processing Quick Start

## Prerequisites
- PostgreSQL database (nsdi-app) accessible at 170.64.167.7:30432
- Docker and Docker Compose installed

## Database Setup
WebODM is configured to use the `odm_data` schema in your `nsdi-app` database for processed imagery data.

## Configuration Changes Made
- **REMOVED**: Local PostgreSQL database service from docker-compose.yml
- **ADDED**: External database connection to nsdi-app database
- **ADDED**: odm_data schema configuration in settings.py
- **ADDED**: Database environment variables in .env file

## Deployment Steps

### 1. Create the odm_data schema (if not exists)
```sql
-- Connect to PostgreSQL database (nsdi-app)
CREATE SCHEMA IF NOT EXISTS odm_data;
GRANT ALL PRIVILEGES ON SCHEMA odm_data TO postgres;
```

### 2. Navigate to WebODM directory
```bash
cd /home/alois/Documents/cassini_hackathon/WebODM
```

### 3. Run database migrations
```bash
docker-compose exec webapp python manage.py migrate
```

### 4. Start WebODM
```bash
docker-compose up -d
```

### 5. Access WebODM
- **Web Interface**: http://localhost:8000
- **Admin Panel**: http://localhost:8000/admin

## Processing Satellite Imagery

### Upload and Process Data
1. **Login** to WebODM web interface
2. **Upload Images**: Click "Upload Images" and select satellite imagery files
3. **Create Project**: Group related images into a project
4. **Start Processing**:
   - Select processing options (orthomosaic, DEM, point cloud)
   - Choose processing profile (default or custom)
   - Click "Start Processing"

### Processing Options for Satellite Data
- **Orthomosaic**: Generate seamless map from satellite images
- **Digital Elevation Model (DEM)**: Create elevation data
- **Point Cloud**: Generate 3D point data
- **Texture Mapping**: Apply textures to 3D models

### Export Results
- Download processed orthomosaics as GeoTIFF
- Export DEMs for terrain analysis
- Generate tiles for web mapping integration

## Integration with Pacific Explorer

### Export Processed Data
1. In WebODM, go to project results
2. Download orthomosaic as GeoTIFF or tiles
3. Import into Pacific Explorer map as additional layers

### API Integration
Use WebODM's REST API to automate processing:
```bash
# Example: Start processing via API
curl -X POST http://localhost:8000/api/projects/ \
  -H "Authorization: JWT <your-token>" \
  -F "images=@satellite_image.tif" \
  -F "name=Satellite Processing"
```

## Troubleshooting

### Database Connection Issues
```bash
# Test database connection
docker-compose exec webapp python manage.py dbshell
# Should connect to odm_data schema
```

### Processing Failures
- Check logs: `docker-compose logs webapp`
- Verify image formats are supported
- Ensure sufficient disk space for processing

### Port Conflicts
- Change port in .env file if 8000 is in use
- Update ALLOWED_HOSTS in settings.py for production

## Performance Tips
- Use GPU acceleration for faster processing (requires CUDA)
- Process images in smaller batches
- Use high-quality satellite imagery for better results

## Git Workflow
```bash
# Update WebODM
git pull origin master

# Check for new features
git log --oneline -10
```

This setup allows you to leverage WebODM's satellite imagery processing capabilities while using your existing database infrastructure for the Pacific Explorer project.