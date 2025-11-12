import initSqlJs from 'sql.js';

let sqlJsInstance: any = null;

export async function initializeSqlJs() {
  if (sqlJsInstance) {
    return sqlJsInstance;
  }

  try {
    sqlJsInstance = await initSqlJs({
      locateFile: (file: string) => {
        // In production (GitHub Pages), use the base path
        if (import.meta.env.PROD) {
          return `/gtfs-sqljs-compare/${file}`;
        }
        // In development, use the public folder
        return `/${file}`;
      }
    });
    return sqlJsInstance;
  } catch (error) {
    console.error('Failed to initialize SQL.js:', error);
    throw error;
  }
}

export function getSqlJsInstance() {
  return sqlJsInstance;
}
