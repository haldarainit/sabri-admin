"use client";

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import React from 'react';
import { createRoot } from 'react-dom/client';
import Invoice from '@/components/Invoice';

export const generateInvoicePDF = async (element, filename = 'invoice.pdf') => {
  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
    });

    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    const pdf = new jsPDF('p', 'mm', 'a4');
    let position = 0;

    pdf.addImage(
      canvas.toDataURL('image/png'),
      'PNG',
      0,
      position,
      imgWidth,
      imgHeight
    );
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(
        canvas.toDataURL('image/png'),
        'PNG',
        0,
        position,
        imgWidth,
        imgHeight
      );
      heightLeft -= pageHeight;
    }

    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
};

export const generateInvoiceFilename = (orderData) => {
  const orderId = orderData.orderId || 'invoice';
  const date = orderData.createdAt 
    ? new Date(orderData.createdAt).toISOString().split('T')[0]
    : new Date().toISOString().split('T')[0];
  return `Sabri_Invoice_${orderId}_${date}.pdf`;
};

export const downloadInvoicePDF = async (orderData) => {
  try {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '210mm';
    container.style.backgroundColor = '#ffffff';
    document.body.appendChild(container);

    const root = createRoot(container);
    root.render(
      React.createElement(Invoice, { orderData })
    );

    await new Promise(resolve => setTimeout(resolve, 150));

    const filename = generateInvoiceFilename(orderData);
    const success = await generateInvoicePDF(container, filename);

    root.unmount();
    document.body.removeChild(container);
    return success;
  } catch (error) {
    console.error('Error downloading invoice:', error);
    return false;
  }
};


