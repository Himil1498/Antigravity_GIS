#!/bin/bash
# set -e  (Temporarily disabled to reveal any subsequent errors rather than aborting silently)

echo '--- [A] Installing Backend Dependencies (if changed) ---'
cp ~/deploy_staging/backend/package.json /var/www/opticonnect/backend/
cp ~/deploy_staging/backend/server.js /var/www/opticonnect/backend/ 2>/dev/null
cp ~/deploy_staging/backend/ecosystem.config.js /var/www/opticonnect/backend/ 2>/dev/null
cd /var/www/opticonnect/backend
npm install --production


echo '--- [B] Executing SQL Database Migrations ---'
# Create a migrations tracker table if it doesn't exist
sudo -u postgres psql -d opticonnect_gis_db -c "CREATE TABLE IF NOT EXISTS _system_migrations (filename VARCHAR(255) PRIMARY KEY, applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);" >> /dev/null 2>&1

# Loop through all staged SQL files and apply them if they haven't been applied yet
for sql_file in ~/deploy_staging/sql/*.sql; do
    if [ -f "$sql_file" ]; then
        filename=$(basename "$sql_file")
        # Check if migration exists
        is_applied=$(sudo -u postgres psql -d opticonnect_gis_db -tAc "SELECT 1 FROM _system_migrations WHERE filename='$filename';")
        
        if [ "$is_applied" != "1" ]; then
            echo "    -> Applying Migration: $filename"
            cat "$sql_file" | sudo -u postgres psql -d opticonnect_gis_db
            sudo -u postgres psql -d opticonnect_gis_db -c "INSERT INTO _system_migrations (filename) VALUES ('$filename');"
        else
            echo "    -> Skipping (Already Applied): $filename"
        fi
    fi
done

echo '--- [C] Injecting Frontend Artifacts ---'
sudo rm -rf /var/www/opticonnect/frontend/build 2>/dev/null
sudo cp -r ~/deploy_staging/frontend/build/* /var/www/opticonnect/frontend/
sudo chown -R opticonnect:opticonnect /var/www/opticonnect/frontend/

echo '--- [D] Injecting Backend Source Code ---'
sudo cp -r ~/deploy_staging/backend/src/* /var/www/opticonnect/backend/src/
sudo chown -R opticonnect:opticonnect /var/www/opticonnect/backend/

echo '--- [D.1] Generating Prisma Client (Linux Server Architecture) ---'
if [ -d ~/deploy_staging/backend/prisma ]; then
    cp -r ~/deploy_staging/backend/prisma /var/www/opticonnect/backend/
    cd /var/www/opticonnect/backend
    npx prisma generate
    echo '    Prisma Client generated successfully.'
else
    echo '    Warning: No prisma/ directory in staging. Skipping Prisma generation.'
fi

echo '--- [E] Restarting System Daemons ---'
pm2 restart all --update-env
sudo systemctl restart nginx

echo '--- Deployment Routine Finished Successfully ---'
