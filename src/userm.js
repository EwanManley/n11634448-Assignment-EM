async function registerUser(username, password, role) {
    const existing = await ddb.send(new GetCommand({
        TableName: TABLE_NAME,
        Key: {
            pk: `user#${username}`,
            sk: 'profile'
        }
    }));

    if (existing.Item) {
        return false;
    }

    const hashedPassword = bcrypt.hashSync(password, 10);
    const userItem = {
        pk: `user#${username}`,
        sk: 'profile',
        'qut-username': QUT_USERNAME,
        id: Date.now(),
        username,
        password: hashedPassword,
        role
    };

    try {
        const putResult = await ddb.send(new PutCommand({
            TableName: TABLE_NAME,
            Item: userItem
        }));
        console.log('DynamoDB PutCommand result:', putResult);
        return true;
    } catch (err) {
        console.error('DynamoDB PutCommand ERROR:', err);
        return false;
    }
}
