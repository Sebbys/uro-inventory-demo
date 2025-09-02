import React from 'react';
import { 
  Html, 
  Head, 
  Body, 
  Container, 
  Section, 
  Heading, 
  Text, 
  Button
} from '@react-email/components';

export interface EmailReportData {
  items: Array<{
    id: number;
    name: string;
    sku: string;
    stock: number;
    threshold: number;
  }>;
  totalItems: number;
  criticalItems: number;
  lowStockItems: number;
  reportDate: string;
}

export function EmailTemplate({ data }: { data: EmailReportData }) {
  const criticalItems = data.items.filter(item => item.stock === 0);
  const lowStockItems = data.items.filter(item => item.stock > 0 && item.stock < item.threshold);

  return (
    <Html>
      <Head />
      <Body style={{ 
        fontFamily: 'Arial, sans-serif', 
        backgroundColor: '#f6f9fc',
        margin: 0,
        padding: 0
      }}>
        <Container style={{ 
          maxWidth: '600px', 
          margin: '0 auto', 
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          {/* Header */}
          <Section style={{ 
            backgroundColor: data.criticalItems > 0 ? '#dc2626' : '#f59e0b',
            padding: '30px 20px',
            textAlign: 'center'
          }}>
            <Heading style={{ 
              color: '#ffffff', 
              margin: 0, 
              fontSize: '28px',
              fontWeight: 'bold'
            }}>
              📊 Inventory Report
            </Heading>
            <Text style={{ 
              color: '#ffffff', 
              margin: '10px 0 0 0',
              fontSize: '16px',
              opacity: 0.9
            }}>
              {data.reportDate}
            </Text>
          </Section>

          {/* Summary */}
          <Section style={{ padding: '30px 20px' }}>
            <Heading style={{ 
              fontSize: '24px', 
              margin: '0 0 20px 0',
              color: '#1f2937'
            }}>
              Summary
            </Heading>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: '20px',
              marginBottom: '30px'
            }}>
              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#fef2f2',
                borderRadius: '8px',
                border: '2px solid #fecaca'
              }}>
                <Text style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold',
                  color: '#dc2626',
                  margin: '0 0 5px 0'
                }}>
                  {data.criticalItems}
                </Text>
                <Text style={{ 
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Critical Items
                </Text>
              </div>

              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#fffbeb',
                borderRadius: '8px',
                border: '2px solid #fed7aa'
              }}>
                <Text style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold',
                  color: '#f59e0b',
                  margin: '0 0 5px 0'
                }}>
                  {data.lowStockItems}
                </Text>
                <Text style={{ 
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Low Stock Items
                </Text>
              </div>

              <div style={{ 
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#f0f9ff',
                borderRadius: '8px',
                border: '2px solid #bae6fd'
              }}>
                <Text style={{ 
                  fontSize: '32px', 
                  fontWeight: 'bold',
                  color: '#0284c7',
                  margin: '0 0 5px 0'
                }}>
                  {data.totalItems}
                </Text>
                <Text style={{ 
                  fontSize: '14px',
                  color: '#6b7280',
                  margin: 0
                }}>
                  Total Items
                </Text>
              </div>
            </div>

            {/* Critical Items */}
            {criticalItems.length > 0 && (
              <>
                <Heading style={{ 
                  fontSize: '20px', 
                  margin: '30px 0 15px 0',
                  color: '#dc2626'
                }}>
                  🚨 Critical Items (Out of Stock)
                </Heading>
                <div style={{ 
                  backgroundColor: '#fef2f2',
                  borderRadius: '8px',
                  border: '2px solid #fecaca',
                  marginBottom: '20px'
                }}>
                  {criticalItems.slice(0, 10).map((item) => (
                    <div key={item.id} style={{
                      padding: '12px',
                      borderBottom: '1px solid #fecaca',
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <Text style={{ 
                        fontWeight: 'bold',
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {item.name}
                      </Text>
                      <Text style={{ 
                        fontFamily: 'monospace',
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {item.sku}
                      </Text>
                      <Text style={{ 
                        textAlign: 'center',
                        color: '#dc2626',
                        fontWeight: 'bold',
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        0
                      </Text>
                      <Text style={{ 
                        textAlign: 'center',
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {item.threshold}
                      </Text>
                    </div>
                  ))}
                </div>
                {criticalItems.length > 10 && (
                  <Text style={{ 
                    fontSize: '14px',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    ... and {criticalItems.length - 10} more critical items
                  </Text>
                )}
              </>
            )}

            {/* Low Stock Items */}
            {lowStockItems.length > 0 && (
              <>
                <Heading style={{ 
                  fontSize: '20px', 
                  margin: '30px 0 15px 0',
                  color: '#f59e0b'
                }}>
                  ⚠️ Low Stock Items
                </Heading>
                <div style={{ 
                  backgroundColor: '#fffbeb',
                  borderRadius: '8px',
                  border: '2px solid #fed7aa',
                  marginBottom: '20px'
                }}>
                  {lowStockItems.slice(0, 10).map((item) => (
                    <div key={item.id} style={{
                      padding: '12px',
                      borderBottom: '1px solid #fed7aa',
                      display: 'grid',
                      gridTemplateColumns: '2fr 1fr 1fr 1fr',
                      gap: '12px',
                      alignItems: 'center'
                    }}>
                      <Text style={{ 
                        fontWeight: 'bold',
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {item.name}
                      </Text>
                      <Text style={{ 
                        fontFamily: 'monospace',
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {item.sku}
                      </Text>
                      <Text style={{ 
                        textAlign: 'center',
                        color: '#f59e0b',
                        fontWeight: 'bold',
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {item.stock}
                      </Text>
                      <Text style={{ 
                        textAlign: 'center',
                        margin: 0,
                        fontSize: '14px'
                      }}>
                        {item.threshold}
                      </Text>
                    </div>
                  ))}
                </div>
                {lowStockItems.length > 10 && (
                  <Text style={{ 
                    fontSize: '14px',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    textAlign: 'center'
                  }}>
                    ... and {lowStockItems.length - 10} more low stock items
                  </Text>
                )}
              </>
            )}

            {/* Action Button */}
            <div style={{ 
              textAlign: 'center',
              margin: '40px 0 20px 0'
            }}>
              <Button
                href="http://localhost:3000/products"
                style={{
                  backgroundColor: '#3b82f6',
                  color: '#ffffff',
                  padding: '15px 30px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  display: 'inline-block'
                }}
              >
                View Inventory Dashboard
              </Button>
            </div>
          </Section>

          {/* Footer */}
          <Section style={{ 
            backgroundColor: '#f8fafc',
            padding: '20px',
            textAlign: 'center',
            borderTop: '1px solid #e2e8f0'
          }}>
            <Text style={{ 
              fontSize: '14px',
              color: '#6b7280',
              margin: 0
            }}>
              This report was generated automatically by your Inventory Management System.
            </Text>
            <Text style={{ 
              fontSize: '12px',
              color: '#9ca3af',
              margin: '5px 0 0 0'
            }}>
              © 2024 Inventory System. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
