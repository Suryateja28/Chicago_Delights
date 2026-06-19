// Native fetch
const test = async () => {
  try {
    const res = await fetch('http://localhost:5000/api/admin/orders');
    if (!res.ok) {
        console.log("Failed to fetch all orders");
    } else {
        const orders = await res.json();
        console.log("All orders count:", orders.length);
        if (orders.length > 0) {
            const phone = orders[0].customer.phone;
            console.log("Testing with phone:", phone);
            const res2 = await fetch('http://localhost:5000/api/orders/customer/' + phone);
            const customerOrders = await res2.json();
            console.log("Customer orders found:", customerOrders.length);
            console.log("Status of latest:", customerOrders[0].status);
        }
    }
  } catch (err) {
    console.error(err);
  }
};
test();
