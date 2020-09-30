import { gql } from '@apollo/client';

export const CREATE_ACCOUNT = gql`
    mutation CreateAccountAfterCheckout(
        $email: String!
        $firstname: String!
        $lastname: String!
        $password: String!
        $is_subscribed: Boolean!
    ) {
        createCustomer(
            input: {
                email: $email
                firstname: $firstname
                lastname: $lastname
                password: $password
                is_subscribed: $is_subscribed
            }
        ) {
            # The createCustomer mutation returns a non-nullable CustomerOutput type
            # which requires that at least one of the sub fields be returned.
            customer {
                id
            }
        }
    }
`;

export const GET_CUSTOMER = gql`
    query GetCustomerAfterCheckout {
        customer {
            id
            email
            firstname
            lastname
            is_subscribed
        }
    }
`;

export default {
    createAccountMutation: CREATE_ACCOUNT,
    getCustomerQuery: GET_CUSTOMER
};
