# Account

## Register  

Create an Account for the authenticated User if an Account for that User does
not already exist. Each User can only have one Account.

**URL** : `/v1/account/register`

**Method** : `POST`

**Auth required** : No

**Permissions required** : None

**Data constraints**

Provide email and password of account being created.

```json
{
    "email": "[unicode 64 chars max]",
    "password": "[unicode 64 chars max]"
}
```

**Data example** All fields must be sent.

```json
{
    "email": "test@testemail.com",
    "password": "12345"
}
```

#### Success Response

**Condition** : If everything is OK and an Account didn't exist for this User.

**Code** : `201 CREATED`

**Content example**

```json
{

}
```

#### Error Responses

**Condition** : If Account already exists for User or there is a temporary token issue.

**Code** : `500 Error`

## Login  
Login to an account for a previously registered user. This will return an authentication token for the user, however, the user needs to have validated through clicking the emailed verification link.

**URL** : `/v1/account/login`

**Method** : `POST`

**Auth required** : No

**Permissions required** : Email Verification

**Data constraints**

Provide email and password of account being logged into.

```json
{
    "email": "[unicode 64 chars max]",
    "password": "[unicode 64 chars max]"
}
```

**Data example** All fields must be sent.

```json
{
    "email": "test@testemail.com",
    "password": "12345"
}
```

#### Success Response

**Condition** : If everything is OK and an Account didn't exist for this User.

**Code** : `200`

**Content example**

```json
{
    "user": "USERNAME",
    "token": "TOKEN"
}
```

#### Error Responses

**Condition** : If Account already exists for User or there is a temporary token issue.

**Code** : `500 Error`

## Log Out

Logged out of the account that the user is currently logged into.

**URL** : `/v1/account/logout`

**Method** : `GET`

**Auth required** : Yes (token)

**Permissions required** : None

**Data constraints**

No data needs to be provided as the token is passed in the request.

**Data example**

No data needs to be provided as the token is passed in the request.

#### Success Response

**Condition** : If everything is OK and the log out was successful.

**Code** : `200`


# Venue


# Animal


# Review
