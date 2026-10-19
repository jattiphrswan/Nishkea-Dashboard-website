# Roles and access
| Role | Typical access |
|---|---|
| Owner | company settings, roles, all operations and reports |
| Manager | operations, approved discounts/adjustments, collection reviews |
| Sales/support | assigned leads, customers and orders; no supplier cost by default |
| Inventory | receipts, counts, packing and movements; no finance/roles |
| Accounts | payment/expense records and financial reports; no role administration |
| Customer | own profile, addresses, orders and return requests only |
| Guest | approved public catalogue and guest checkout |

Permissions are explicit actions (product.publish, inventory.adjust, order.refund, cost.view, report.export, role.manage), not just menu visibility. Scope staff to company/location where applicable. Deny by default. Recheck access on every server request and object ID. Disabling staff revokes sessions; role changes take effect without trusting old browser state. Audit role changes, exports, price changes, refunds, adjustments and review decisions. Separate approve/execute for high-value actions using configurable business thresholds.
