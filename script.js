// ============ FUNCIONES BASE — NO CAMBIAR ============
  function toggleMenu(titulo) {
    const seccion = titulo.nextElementSibling;
    if (!seccion) return;
    seccion.style.display = seccion.style.display === "block" ? "none" : "block";
  }

  function toggleCantidad(checkbox) {
    const item = checkbox.closest(".item");
    if (!item) return;
    const cantidad = item.querySelector(".cantidad");
    if (!cantidad) return;
    if (checkbox.checked) {
      cantidad.disabled = false;
      if (Number(cantidad.value) === 0) cantidad.value = 1;
    } else {
      cantidad.value = 0;
      cantidad.disabled = true;
    }
    calcularTotal();
  }

  function toggleDescripcion(checkbox) {
    const item = checkbox.closest(".item");
    if (!item) return;
    const desc = item.querySelector(".descripcion");
    if (!desc) return;
    desc.style.display = checkbox.checked ? "block" : "none";
  }

  function calcularTotal() {
    let subtotal = 0;
    document.querySelectorAll(".check-plato").forEach(cb => {
      if (!cb.checked) return;
      const item = cb.closest(".item");
      if (!item) return;
      const cantidad = Number(item.querySelector(".cantidad")?.value) || 0;
      if (cantidad <= 0) return;
      const precioTexto = item.querySelector(".precio")?.innerText || "0";
      const precio = Number(precioTexto.replace(/[^0-9]/g, "")) || 0;
      subtotal += precio * cantidad;
    });

    // Domicilio: costo variable según zona, NO se suma automáticamente.
    // Empaque: sin costo adicional, no se cobra.

    document.getElementById("total").innerText = "$" + subtotal.toLocaleString("es-CO");
    document.getElementById("totalPedido").value = subtotal;
  }

  // ============ LÓGICA DE VISIBILIDAD DEL FORMULARIO ============
  document.getElementById("tipoEntrega").addEventListener("change", function () {
    const val = this.value;
    document.getElementById("direccionField").style.display = val === "A domicilio" ? "block" : "none";
    document.getElementById("costoDomicilio").style.display = val === "A domicilio" ? "block" : "none";
    document.getElementById("mesaField").style.display = val === "Comer dentro del local" ? "block" : "none";
  });

  document.getElementById("tipoPago").addEventListener("change", function () {
    const val = this.value;
    document.getElementById("efectivoField").style.display = val === "Efectivo" ? "block" : "none";
    document.getElementById("infoPago").style.display = val === "QR" ? "block" : "none";
    document.getElementById("infoQR").style.display = val === "QR" ? "block" : "none";
  });

  // ============ ENVÍO DEL PEDIDO ============
  document.getElementById("pedidoForm").addEventListener("submit", function (e) {
    e.preventDefault();
    const btn = this.querySelector(".btn");
    if (btn.disabled) return;

    const nombre = document.getElementById("nombre").value;
    const telefono = document.getElementById("telefono").value;
    const tipoEntrega = document.getElementById("tipoEntrega").value;
    const direccion = document.getElementById("direccion").value;
    const numeroMesa = document.getElementById("numeroMesa").value;
    const tipoPago = document.getElementById("tipoPago").value;
    const efectivoCliente = document.getElementById("efectivoCliente").value;
    const especificaciones = document.getElementById("especificaciones").value;
    const total = document.getElementById("total").innerText;

    let platosTexto = "";
    document.querySelectorAll(".check-plato").forEach(cb => {
      if (!cb.checked) return;
      const item = cb.closest(".item");
      const cantidad = item.querySelector(".cantidad")?.value || 0;
      if (Number(cantidad) <= 0) return;
      platosTexto += "• " + cb.value + " x" + cantidad + "\n";
    });

    let mensaje = "🔥 *NUEVO PEDIDO* 🔥\n\n";
    mensaje += "👤 Nombre: " + nombre + "\n";
    mensaje += "📞 Teléfono: " + telefono + "\n\n";
    mensaje += "🍖 *Pedido:*\n" + platosTexto + "\n";
    mensaje += "📦 Entrega: " + tipoEntrega + "\n";
    if (tipoEntrega === "A domicilio") {
      mensaje += "📍 Dirección: " + direccion + "\n";
      mensaje += "(El valor del domicilio varía según la zona y se confirma por acá)\n";
    }
    if (tipoEntrega === "Comer dentro del local") {
      mensaje += "🔢 Mesa: " + numeroMesa + "\n";
    }
    mensaje += "\n💰 Pago: " + tipoPago + "\n";
    if (tipoPago === "Efectivo" && efectivoCliente) {
      mensaje += "💵 Paga con: $" + efectivoCliente + "\n";
    }
    if (tipoPago === "QR") {
      mensaje += "💳 Pago por QR — enviará el comprobante por este chat\n";
    }
    if (especificaciones) {
      mensaje += "\n📒 Especificaciones: " + especificaciones + "\n";
    }
    mensaje += "\n💸 *Total: " + total + "*";

    // ============ GUARDADO AUTOMÁTICO EN GOOGLE SHEETS ============
    const direccionOMesa = tipoEntrega === "Comer dentro del local" ? numeroMesa : direccion;

    const formData = new FormData();
    formData.append('entry.2112356656', nombre);
    formData.append('entry.1109805837', telefono);
    formData.append('entry.918659858', platosTexto);
    formData.append('entry.32330590', tipoEntrega);
    formData.append('entry.1724473562', direccionOMesa);
    formData.append('entry.2088359164', tipoPago);
    formData.append('entry.1752051323', especificaciones);
    formData.append('entry.677300549', total);

    const numero = "573023397199";

    fetch('https://docs.google.com/forms/d/e/1FAIpQLSeDIOygCyZh6OFR9TClQpwvVAsta4-soMebPfGo5GhUpaxoWA/formResponse', {
      method: 'POST',
      mode: 'no-cors',
      body: formData
    })
    .catch(() => {})
    .finally(() => {
      window.location.href = "https://wa.me/" + numero + "?text=" + encodeURIComponent(mensaje);
      setTimeout(() => {
        location.reload();
      }, 1000);
    });

    btn.disabled = true;
    btn.innerText = "Enviando...";
    setTimeout(() => {
      btn.disabled = false;
      btn.innerText = "📲 Enviar Pedido";
    }, 5000);
  });