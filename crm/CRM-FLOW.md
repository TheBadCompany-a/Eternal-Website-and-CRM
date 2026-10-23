# Eternal Repos CRM — How It Works (Simple Flow)

## 1. The big picture

A family contacts Eternal Repos → it becomes a **lead** → staff talk to the family, prepare a plan and quote → the family confirms and pays → a driver and vehicle are assigned → the service happens → payment is closed and feedback is collected.

Every case keeps **one permanent reference number** (for example `ER-DEL-26OCT-042-PK`) from the first call to the last receipt, so sales, operations and accounts always talk about the same case.

## 2. Where cases come from

| Source | What happens |
|---|---|
| Website "Arrange a Service" wizard | Creates a lead automatically (source: Website) |
| Book a Star / Name a Star | Creates a Star booking |
| Customised package | Creates a lead with the chosen items |
| Phone, WhatsApp, walk-in | Staff click **+ New lead** on the Leads screen |
| Google / Meta ads | Source and campaign are recorded on the lead |

Leads with the same phone number are flagged as **possible duplicates**.

## 3. Case stages (status)

```
New Inquiry → Contacted → Plan Review → Quotation → Confirmed → In Execution → Completed
```

| Stage | Meaning | Who usually handles it |
|---|---|---|
| New Inquiry | Just arrived, nobody has called yet | Sales / coordinator |
| Contacted | First call done | Sales / coordinator |
| Plan Review | Needs are understood, plan being shaped | Coordinator |
| Quotation | Quote sent to the family | Sales |
| Confirmed | Family agreed (usually an advance is paid) | Coordinator |
| In Execution | Service is happening today | Operations / driver |
| Completed | Service done and closed | Accounts closes payment |

## 4. Payment stages

```
Estimate → Final Amount → Payment Requested → Advance Received / Payment Received → Receipt Generated
```

Payments can come through the payment gateway or be recorded by staff. Every payment is kept in the payment history.

## 5. Step by step

1. **Lead arrives** (Leads screen). Check the source, remove duplicates, set priority and customer type.
2. **First contact.** Call the family, note the need (Immediate, Planned, Transfer, or Not sure) and move to *Contacted*.
3. **Plan.** Choose from Service Plans or build one in the Sales Configurator. A plan can be shared with the family through a link.
4. **Quotation** (Quotations screen). Price vehicle, distance, staff, florals, rituals and extras. Status goes Draft → Sent → Viewed → Approved.
5. **Booking confirmed** (Bookings screen). Collect advance payment; the case becomes *Confirmed*.
6. **Operations** (Operations screen). Pick a driver and vehicle (busy or on-leave ones are greyed out; **Suggest** picks a free pair; **Custom…** lets you type a name not in the list). Assign a coordinator, set pickup and destination, tick the "Before the service" checklist.
7. **Service day.** The driver opens the **Driver App**: Start Journey → Arrived at Pickup → Service Started → Reached Destination → Complete Service. Live location shows in the CRM.
8. **Close.** Mark *Completed*, collect the balance, generate the receipt (Payments, Documents).
9. **After.** Send feedback request and tributes; check Reports.

## 6. Screens at a glance

| Group | Screens |
|---|---|
| Sales | Leads, Stars, Name a Star, Customers, Service Plans, Sales Configurator, Quotations |
| Delivery | Arrangements, Bookings, Operations, Driver App |
| Fleet & people | Vehicles, Drivers & Teams, HR Overview |
| Money & records | Payments, Documents |
| Care & insight | Communications, Feedback, Reports |
| Admin | Dashboard, Settings |

The **Dashboard** shows six numbers (Active Arrangements, Immediate Requests, Upcoming Today, Services In Progress, Completed Today, Pending Payments). Click one to see its cases right below.

## 7. Who can do what

| Role | Main use |
|---|---|
| Admin | Everything, including deleting leads and settings |
| Sales | Leads, quotations, plans |
| Coordinator | Cases from contact to completion |
| Operations | Drivers, vehicles, service day |
| Accounts | Payments, receipts |
| HR | Team and HR overview |
| Backend executive | Back-office data entry |
| Driver | Only the Driver App |

Admins can change which screens each role sees in Settings.

## 8. Behind the scenes

- Database and login: Supabase (Postgres, Auth, row-level security, realtime updates).
- Website bookings reach the CRM through a public booking function; everything else needs a staff login.
- Deleting a lead hides it but keeps the record for audit.
