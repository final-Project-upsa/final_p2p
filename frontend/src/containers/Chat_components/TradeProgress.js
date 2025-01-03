import React from 'react';
import { CheckCircle2, DollarSign, Package, Truck, ThumbsUp } from 'lucide-react';

// Utility function for product images
export const getProductImages = (product) => {
  const images = [];
  if (product.main_image_url) images.push(product.main_image_url);
  if (product.image1_url) images.push(product.image1_url);
  if (product.image2_url) images.push(product.image2_url);
  if (product.image3_url) images.push(product.image3_url);
  if (product.image4_url) images.push(product.image4_url);
  if (product.image5_url) images.push(product.image5_url);
  return images.filter(Boolean);
};

// Trade status configuration
export const TRADE_STATUSES = {
  INITIAL: 'initial',
  ACCEPTED: 'accepted',
  PAYMENT_HELD: 'payment_held',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

const getStepIcon = (step) => {
  switch (step) {
    case 'Trade Started':
      return CheckCircle2;
    case 'Payment in Escrow':
      return DollarSign;
    case 'Order Shipped':
      return Package;
    case 'Order Delivered':
      return Truck;
    case 'Trade Completed':
      return ThumbsUp;
    default:
      return CheckCircle2;
  }
};

export const StepIndicator = ({ currentStatus, completedSteps }) => {
  const steps = [
    { label: 'Trade Started', status: TRADE_STATUSES.ACCEPTED },
    { label: 'Payment in Escrow', status: TRADE_STATUSES.PAYMENT_HELD },
    { label: 'Order Shipped', status: TRADE_STATUSES.SHIPPED },
    { label: 'Order Delivered', status: TRADE_STATUSES.DELIVERED },
    { label: 'Trade Completed', status: TRADE_STATUSES.COMPLETED }
  ];

  const getCurrentStep = () => {
    if (!currentStatus || currentStatus === TRADE_STATUSES.INITIAL) return -1;
    if (currentStatus === TRADE_STATUSES.CANCELLED) return -1;
    return steps.findIndex(step => step.status === currentStatus);
  };

  const currentStep = getCurrentStep();

  return (
    <div className="bg-white rounded-2xl p-4 lg:p-8 shadow-sm hover:shadow-md transition-shadow">
      <div className="relative">
        {/* Progress Bar */}
        <div className="absolute top-[2.5rem] left-0 w-full h-1 bg-gray-200">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500" 
            style={{
              width: `${currentStep >= 0 ? (currentStep / (steps.length - 1)) * 100 : 0}%`
            }} 
          />
        </div>
        
        {/* Steps */}
        <div className="flex justify-between">
          {steps.map((step, idx) => {
            const Icon = getStepIcon(step.label);
            const isCompleted = idx <= currentStep;
            const isPending = idx === currentStep + 1;
            
            return (
              <div key={step.label} className="relative" style={{width: '20%'}}>
                <div className="flex flex-col items-center">
                  <div className={`
                    w-8 h-8 lg:w-12 lg:h-12 rounded-full flex items-center justify-center z-10 
                    transition-all duration-300 transform
                    ${isCompleted 
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 scale-110' 
                      : isPending
                        ? 'bg-blue-100'
                        : 'bg-gray-200'}`}
                  >
                    <Icon className={`
                      w-4 h-4 lg:w-6 lg:h-6 
                      ${isCompleted 
                        ? 'text-white' 
                        : isPending
                          ? 'text-blue-500'
                          : 'text-gray-400'}
                    `} />
                  </div>
                  <div className="mt-4 text-center">
                    <div className={`
                      text-[10px] lg:text-sm font-medium
                      ${isCompleted 
                        ? 'text-blue-600' 
                        : isPending
                          ? 'text-blue-500'
                          : 'text-gray-400'}
                    `}>
                      {step.label}
                    </div>
                    {completedSteps?.[step.status]?.date && (
                      <div className="text-[8px] lg:text-xs text-gray-400 mt-1">
                        {new Date(completedSteps[step.status].date).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Message */}
      {currentStatus === TRADE_STATUSES.CANCELLED && (
        <div className="mt-6 text-center text-red-500 font-medium">
          This trade has been cancelled
        </div>
      )}
    </div>
  );
};

export default StepIndicator;