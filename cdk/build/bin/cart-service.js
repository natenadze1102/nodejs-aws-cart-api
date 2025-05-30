#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("aws-cdk-lib");
const cart_service_stack_1 = require("../lib/cart-service-stack");
const app = new cdk.App();
new cart_service_stack_1.CartServiceStack(app, 'CartServiceStack', {
    env: {
        account: '595131344444',
        region: 'eu-central-1',
    },
    description: 'Cart Service with PostgreSQL database',
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FydC1zZXJ2aWNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vYmluL2NhcnQtc2VydmljZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSx1Q0FBcUM7QUFDckMsbUNBQW1DO0FBQ25DLGtFQUE2RDtBQUU3RCxNQUFNLEdBQUcsR0FBRyxJQUFJLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQztBQUMxQixJQUFJLHFDQUFnQixDQUFDLEdBQUcsRUFBRSxrQkFBa0IsRUFBRTtJQUM1QyxHQUFHLEVBQUU7UUFDSCxPQUFPLEVBQUUsY0FBYztRQUN2QixNQUFNLEVBQUUsY0FBYztLQUN2QjtJQUNELFdBQVcsRUFBRSx1Q0FBdUM7Q0FDckQsQ0FBQyxDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiIyEvdXNyL2Jpbi9lbnYgbm9kZVxuaW1wb3J0ICdzb3VyY2UtbWFwLXN1cHBvcnQvcmVnaXN0ZXInO1xuaW1wb3J0ICogYXMgY2RrIGZyb20gJ2F3cy1jZGstbGliJztcbmltcG9ydCB7IENhcnRTZXJ2aWNlU3RhY2sgfSBmcm9tICcuLi9saWIvY2FydC1zZXJ2aWNlLXN0YWNrJztcblxuY29uc3QgYXBwID0gbmV3IGNkay5BcHAoKTtcbm5ldyBDYXJ0U2VydmljZVN0YWNrKGFwcCwgJ0NhcnRTZXJ2aWNlU3RhY2snLCB7XG4gIGVudjoge1xuICAgIGFjY291bnQ6ICc1OTUxMzEzNDQ0NDQnLFxuICAgIHJlZ2lvbjogJ2V1LWNlbnRyYWwtMScsXG4gIH0sXG4gIGRlc2NyaXB0aW9uOiAnQ2FydCBTZXJ2aWNlIHdpdGggUG9zdGdyZVNRTCBkYXRhYmFzZScsXG59KTtcbiJdfQ==