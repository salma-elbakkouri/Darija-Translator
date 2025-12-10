class AuthMiddleware {
    constructor() {
        this.users = this.loadUsers();
    }

    loadUsers() {
        const usersString = process.env.AUTH_USERS;
        
        if (!usersString) {
            console.warn('! No AUTH_USERS in .env. Using default credentials.');
            return new Map([['admin', 'salma']]);
        }

        const usersMap = new Map();
        usersString.split(',').forEach(pair => {
            const [username, password] = pair.split(':');
            if (username && password) {
                usersMap.set(username.trim(), password.trim());
            }
        });

        return usersMap;
    }

    extractCredentials(authHeader) {
        if (!authHeader?.startsWith('Basic ')) {
            return null;
        }

        try {
            const base64Credentials = authHeader.substring(6);
            const credentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');
            const [username, password] = credentials.split(':');
            
            return (username && password) ? { username, password } : null;
        } catch (error) {
            console.error('Error decoding credentials:', error);
            return null;
        }
    }

    authenticate = (req, res, next) => {
        const credentials = this.extractCredentials(req.headers.authorization);

        if (!credentials) {
            return res.status(401)
                .header('WWW-Authenticate', 'Basic realm="Darija Translator API"')
                .json({
                    success: false,
                    error: 'Authentication required',
                    message: 'Please provide valid Basic Authentication credentials'
                });
        }

        // Validate credentials
        const storedPassword = this.users.get(credentials.username);
        if (!storedPassword || storedPassword !== credentials.password) {
            return res.status(401)
                .header('WWW-Authenticate', 'Basic realm="Darija Translator API"')
                .json({
                    success: false,
                    error: 'Invalid credentials',
                    message: 'Username or password is incorrect'
                });
        }

        // Attach user to request
        req.user = { username: credentials.username };
        next();
    };
}

export default AuthMiddleware;