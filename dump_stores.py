import psycopg2
conn = psycopg2.connect('postgresql://neondb_owner:npg_3UNBtaikxWe7@ep-late-credit-ate5mpw7.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require')
c = conn.cursor()
c.execute('SELECT name FROM stores LIMIT 10')
res = c.fetchall()
with open('stores_dump.txt', 'w', encoding='utf-8') as f:
    for row in res:
        f.write(row[0] + '\n')
