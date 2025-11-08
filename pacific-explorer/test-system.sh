#!/bin/bash

echo "🧪 Testing Pacific Explorer Role System"
echo "========================================"
echo ""

cd /home/alois/Documents/cassini_hackathon/pacific-explorer

echo "1️⃣ Checking database connection..."
PGPASSWORD=admin123 psql -h 170.64.167.7 -p 30432 -U postgres -d pacific-explorer -c "SELECT current_database();" > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Database connection OK"
else
    echo "❌ Database connection FAILED"
    exit 1
fi

echo ""
echo "2️⃣ Checking Role enum in database..."
ROLES=$(PGPASSWORD=admin123 psql -h 170.64.167.7 -p 30432 -U postgres -d pacific-explorer -t -c "SELECT enumlabel FROM pg_enum WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = 'Role');")
echo "$ROLES" | while read role; do
    role=$(echo $role | xargs)
    if [ ! -z "$role" ]; then
        echo "   ✓ $role"
    fi
done

echo ""
echo "3️⃣ Checking users and their roles..."
PGPASSWORD=admin123 psql -h 170.64.167.7 -p 30432 -U postgres -d pacific-explorer -c "SELECT username, role, \"isActive\" FROM \"User\";" 2>/dev/null

echo ""
echo "4️⃣ Checking Prisma client..."
if [ -d "node_modules/@prisma/client" ]; then
    echo "✅ Prisma client exists"
else
    echo "❌ Prisma client missing"
fi

echo ""
echo "5️⃣ Checking dev server status..."
if curl -s http://localhost:3005 > /dev/null 2>&1; then
    echo "✅ Dev server is running on http://localhost:3005"
else
    echo "⚠️  Dev server not responding (might still be starting)"
fi

echo ""
echo "========================================"
echo "✅ System Check Complete!"
echo ""
echo "🔐 Admin Login:"
echo "   URL: http://localhost:3005/auth/signin"
echo "   Username: anapitalai"
echo "   Password: admin123"
echo ""
echo "📋 Available Roles:"
echo "   • TOURIST (default for new users)"
echo "   • HOTEL_OWNER (can add hotels)"
echo "   • ADMIN (full access)"
