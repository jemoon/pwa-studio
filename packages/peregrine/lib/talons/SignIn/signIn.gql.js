import { gql } from '@apollo/client';

export const GET_CUSTOMER = gql`
    query GetCustomerAfterSignIn {
        customer {
            id
            email
            firstname
            lastname
            is_subscribed
        }
    }
`;

export const SIGN_IN = gql`
    mutation signIn($email: String!, $password: String!) {
        generateCustomerToken(email: $email, password: $password) {
            token
        }
    }
`;

export default {
    getCustomerQuery: GET_CUSTOMER,
    signInMutation: SIGN_IN
};
